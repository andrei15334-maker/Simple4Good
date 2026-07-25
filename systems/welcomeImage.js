const { Events, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    name: 'WelcomeImage',
    
    init(client) {
        client.on(Events.GuildMemberAdd, async (member) => {
            const guild = member.guild;
            
            // Gasim canalul chat-general pentru a trimite mesajul
            const welcomeChannel = guild.channels.cache.find(c => c.name === '💬・chat-general');
            if (!welcomeChannel) return;

            try {
                // Dimensiuni imagine
                const canvas = createCanvas(800, 300);
                const ctx = canvas.getContext('2d');

                // Fundal (putem pune o poza daca avem, altfel gradient)
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                gradient.addColorStop(0, '#2b5876');
                gradient.addColorStop(1, '#4e4376');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Desenam niste "valuri" ca design
                ctx.beginPath();
                ctx.moveTo(0, 150);
                ctx.bezierCurveTo(200, 250, 400, 50, 800, 150);
                ctx.lineTo(800, 300);
                ctx.lineTo(0, 300);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fill();

                // Text: "BUN VENIT"
                ctx.font = 'bold 50px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('BUN VENIT', 300, 120);

                // Text: Numele jucatorului
                ctx.font = 'bold 40px sans-serif';
                ctx.fillStyle = '#f1c40f'; // Galben/Auriu
                ctx.fillText(member.user.username.toUpperCase(), 300, 180);

                // Text: Membrul X
                ctx.font = '25px sans-serif';
                ctx.fillStyle = '#ecf0f1';
                ctx.fillText(`Esti membrul #${guild.memberCount}!`, 300, 230);

                // Avatarul
                const avatarRadius = 80;
                const avatarX = 150;
                const avatarY = 150;

                ctx.beginPath();
                ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();

                const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
                const avatarImg = await loadImage(avatarUrl);
                ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

                // Facem imaginea atasament
                const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome-image.png' });

                // Trimitem in chat
                await welcomeChannel.send({ 
                    content: `🎉 Salutare <@${member.id}>! Bine ai venit în comunitatea **Simple4Good**! Nu uita să citești regulamentul!`, 
                    files: [attachment] 
                });

            } catch (err) {
                console.error('Eroare la generarea imaginii de bun venit:', err);
            }
        });
    }
};
