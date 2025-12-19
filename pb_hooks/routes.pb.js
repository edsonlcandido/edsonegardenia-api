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
      console.error("Configuração de app não encontrada");
      return c.json(500, {
        error: "Configuração do aplicativo não encontrada"
      });
    }

    const modo = configuracaoApp.get("modo_pagbank"); // sandbox ou producao
    if (!modo) {
      console.error("Modo PagBank não configurado");
      return c.json(500, {
        error: "Modo de pagamento não configurado"
      });
    }

    // Buscar configuração do PagBank correspondente ao modo
    const configuracaoPagbank = c.app.findFirstRecordByData("configuracao_pagbank", "id", modo);
    
    if (!configuracaoPagbank) {
      console.error(`Configuração PagBank para modo '${modo}' não encontrada`);
      return c.json(500, {
        error: `Configuração de pagamento para modo '${modo}' não encontrada`
      });
    }

    const urlBase = configuracaoPagbank.get("url");
    const token = configuracaoPagbank.get("token");

    if (!urlBase || !token) {
      console.error("URL ou token do PagBank não configurados");
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
      console.error("Erro ao criar checkout PagBank:", {
        status: res.statusCode,
        message: bodyStr
      });
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
      console.error("Link PAY não encontrado na resposta do PagBank");
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
    console.error("Erro ao processar checkout: " + error);
    return c.json(500, {
      error: "Erro interno do servidor"
    });
  }
});
