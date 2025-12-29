/// <reference path="../pb_data/types.d.ts" />

// Rota para criar checkout do PagBank
routerAdd("post", "/api/criar-checkout", (c) => {
  try {
    // Parsear o corpo da requisição
    const bodyData = c.requestInfo().body;
    const data = {
      titulo: bodyData.titulo,
      valor: bodyData.valor
    };

    // Validar dados recebidos
    if (!data.titulo || !data.valor) {
      return c.json(400, {
        error: "Campos 'titulo' e 'valor' são obrigatórios"
      });
    }

    const titulo = String(data.titulo).trim();
    const valor = parseInt(data.valor, 10);

    // Validar valor
    if (isNaN(valor) || valor < 1) {
      return c.json(400, {
        error: "Valor deve ser um número inteiro positivo"
      });
    }

    // Buscar configuração do modo (sandbox ou producao)
    const configuracaoApp = c.app.findRecordById("configuracao_app", "settings");
    if (!configuracaoApp) {
      $app.logger().error("Configuração de app não encontrada");
      return c.json(500, {
        error: "Configuração do aplicativo não encontrada"
      });
    }

    const modo = configuracaoApp.get("modo_pagbank"); // sandbox ou producao
    if (!modo) {
      $app.logger().error("Modo PagBank não configurado");
      return c.json(500, {
        error: "Modo de pagamento não configurado"
      });
    }

    // Buscar configuração do PagBank correspondente ao modo
    const configuracaoPagbank = c.app.findFirstRecordByData("configuracao_pagbank", "id", modo);
    
    if (!configuracaoPagbank) {
      $app.logger().error(`Configuração PagBank para modo '${modo}' não encontrada`);
      return c.json(500, {
        error: `Configuração de pagamento para modo '${modo}' não encontrada`
      });
    }

    const urlBase = configuracaoPagbank.get("url");
    const token = configuracaoPagbank.get("token");

    if (!urlBase || !token) {
      $app.logger().error("URL ou token do PagBank não configurados");
      return c.json(500, {
        error: "Credenciais de pagamento incompletas"
      });
    }

    // Converter valor para centavos (ex: 100 reais = 10000 centavos)
    const unitAmount = valor * 100;

    // Montar payload para PagBank
    const checkoutPayload = {
      items: [
        {
          quantity: 1,
          unit_amount: unitAmount,
          description: titulo
        }
      ],
      payment_methods_configs: [
        {
          config_options: [
            {
              option: "INSTALLMENTS_LIMIT",
              value: "6"
            }
          ],
          type: "CREDIT_CARD"
        },
        {
          config_options: [
            {
              option: "INSTALLMENTS_LIMIT",
              value: "1"
            }
          ],
          type: "DEBIT_CARD"
        }
      ],
      customer_modifiable: true
    };

    // Fazer chamada POST para PagBank
    // Remove barra trailing do urlBase se existir para evitar barra dupla
    const baseUrl = urlBase.replace(/\/$/, "");
    const checkoutUrl = baseUrl + "/checkouts";
    


    const res = $http.send({
      url: checkoutUrl,
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(checkoutPayload),
      timeout: 30
    });
    // Verificar resposta do PagBank
    if (res.statusCode < 200 || res.statusCode >= 300) {
      const bodyStr = toString(res.body);
      $app.logger().error("Erro ao criar checkout PagBank - Status: " + res.statusCode);
      $app.logger().error("Erro ao criar checkout PagBank - Body: " + bodyStr);
      
      try {
        const errorData = JSON.parse(bodyStr);
        $app.logger().error("Erro ao criar checkout PagBank - JSON: " + JSON.stringify(errorData));
      } catch (e) {
        // Body não é JSON, apenas mostra como string
      }
      
      return c.json(res.statusCode >= 500 ? 500 : 400, {
        error: "Erro ao processar pagamento. Verifique os dados e tente novamente."
      });
    }

    // Parsear resposta do PagBank
    const responseData = res.json;

    // Extrair link PAY da resposta
    let payUrl = null;
    if (responseData.links && Array.isArray(responseData.links)) {
      const payLink = responseData.links.find(link => link.rel === "PAY");
      if (payLink) {
        payUrl = payLink.href;
      }
    }

    if (!payUrl) {
      $app.logger().error("Link PAY não encontrado na resposta do PagBank");
      return c.json(500, {
        error: "Resposta inválida do serviço de pagamento"
      });
    }

    // Retornar URL do checkout
    return c.json(200, {
      url: payUrl,
      checkoutId: responseData.id
    });

  } catch (error) {
    $app.logger().error("Erro ao processar checkout: " + error);
    return c.json(500, {
      error: "Erro interno do servidor"
    });
  }
});

onRecordCreateRequest((e) => {
    e.next()
    
    // Verifica se é a coleção de confirmação
    if (e.collection.name !== "confirmacao") {
        return
    }

    const nome = e.record.get("nome") || "Convidado"
    const quantidadePessoas = e.record.get("quantidade_pessoas") || 1
    const mensagem = e.record.get("mensagem") || ""
    
    // Email HTML para confirmação
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d4af37; text-align: center; margin-bottom: 30px;">
                ✨ Nova Confirmação de Presença! ✨
            </h2>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 15px; margin: 20px 0; border-left: 5px solid #d4af37;">
                <h3 style="color: #333; margin-bottom: 20px; font-size: 18px;">Detalhes da Confirmação:</h3>
                
                <table style="width: 100%; border-spacing: 10px;">
                    <tr>
                        <td style="font-weight: bold; color: #555; width: 140px;">Nome:</td>
                        <td style="color: #333;">${nome}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #555;">Pessoas:</td>
                        <td style="color: #333;">${quantidadePessoas}</td>
                    </tr>
                    <tr>
                        <td style="font-weight: bold; color: #555;">Data:</td>
                        <td style="color: #333;">${new Date().toLocaleString('pt-BR')}</td>
                    </tr>
                </table>
                
                ${mensagem ? `
                    <div style="margin-top: 25px; padding: 20px; background: white; border-radius: 10px; border-left: 4px solid #d4af37;">
                        <h4 style="color: #d4af37; margin: 0 0 15px 0; font-size: 16px;">💌 Mensagem:</h4>
                        <p style="margin: 0; font-style: italic; color: #555; line-height: 1.6; font-size: 15px;">"${mensagem}"</p>
                    </div>
                ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #f0f0f0, #e8e8e8); border-radius: 15px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                    🎉 Mais um convidado confirmado para o grande dia!
                </p>
                <p style="margin: 0; color: #d4af37; font-weight: bold; font-size: 16px;">
                    Edinho & Gardenia - 07 de Fevereiro de 2026 💕
                </p>
            </div>
        </div>
    `
    
    try {
        // Envia email usando o MailerMessage do PocketBase
        const message = new MailerMessage({
            from: {
                address: e.app.settings().meta.senderAddress,
                name: e.app.settings().meta.senderName || "Casamento Edinho & Gardenia"
            },
            to: [
                {address: "edson.luiz.candido@gmail.com"}, // Altere para o email do Edinho
                {address: "deni_cea@yahoo.com.br"}       // Altere para o email da Gardenia
            ],
            subject: `🎊 Nova Confirmação: ${nome} (${quantidadePessoas} ${quantidadePessoas === 1 ? 'pessoa' : 'pessoas'})`,
            html: htmlContent
        })

        e.app.newMailClient().send(message)
        $app.logger().info(`✅ Email de confirmação enviado - ${nome} (${quantidadePessoas} pessoas)`)
        
    } catch (err) {
        $app.logger().error("❌ Erro ao enviar email de confirmação:", err)
    }
}, "confirmacao")
