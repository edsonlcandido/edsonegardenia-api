/// <reference path="../pb_data/types.d.ts" />

// Hook para enviar email quando alguém confirmar presença
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
        console.log(`✅ Email de confirmação enviado - ${nome} (${quantidadePessoas} pessoas)`)
        
    } catch (err) {
        console.error("❌ Erro ao enviar email de confirmação:", err)
    }
}, "confirmacao")
