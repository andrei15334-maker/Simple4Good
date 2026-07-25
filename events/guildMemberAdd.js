const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        console.log(`[BUN VENIT] A intrat ${member.user.tag} pe server! Se genereaza imaginea...`);
        const guild = member.guild;
        
        // Gasim canalul chat-general pentru a trimite mesajul
        const welcomeChannel = guild.channels.cache.find(c => c.name === '💬・chat-general');
        if (!welcomeChannel) {
            console.log(`[EROARE] Nu am putut gasi canalul 💬・chat-general`);
            return;
        }

        try {
            // Dimensiuni imagine marite de 1.5x
            const canvas = createCanvas(1200, 450);
            const ctx = canvas.getContext('2d');

            // Fundal
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#2b5876');
            gradient.addColorStop(1, '#4e4376');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Valuri
            ctx.beginPath();
            ctx.moveTo(0, 225);
            ctx.bezierCurveTo(300, 375, 600, 75, 1200, 225);
            ctx.lineTo(1200, 450);
            ctx.lineTo(0, 450);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();

            // Text: "BUN VENIT"
            ctx.font = 'bold 75px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('BUN VENIT', 450, 180);

            // Text: Numele jucatorului
            ctx.font = 'bold 60px sans-serif';
            ctx.fillStyle = '#f1c40f'; // Galben/Auriu
            let userName = member.user.username;
            if (userName.length > 15) userName = userName.substring(0, 15) + '...';
            ctx.fillText(userName.toUpperCase(), 450, 270);

            // Text: Membrul X
            ctx.font = '35px sans-serif';
            ctx.fillStyle = '#ecf0f1';
            ctx.fillText(`Ești membrul #${guild.memberCount}!`, 450, 345);

            // Avatarul
            const avatarRadius = 120;
            const avatarX = 225;
            const avatarY = 225;

            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
            const avatarImg = await loadImage(avatarUrl);
            ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);

            // Facem imaginea atasament
            const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'welcome-image.png' });

            const welcomeMessage = `🎉 Salutare <@${member.id}>! Bine ai venit pe comunitatea **Simple4Good**!\nSuntem fericiți să te avem alături ca membrul #${guild.memberCount}.\nTe rugăm să verifici canalul de regulament pentru a avea acces complet!`;

            try {
                // Incercam sa trimitem in privat
                await member.send({ content: welcomeMessage, files: [attachment] });
                console.log(`[BUN VENIT] Mesaj privat trimis cu succes catre ${member.user.tag}!`);
            } catch (dmError) {
                // Daca are DM-urile inchise, dam fallback pe chat-general
                console.log(`[BUN VENIT] Nu am putut da DM lui ${member.user.tag}, trimitem pe chat-general.`);
                if (welcomeChannel) {
                    await welcomeChannel.send({ content: welcomeMessage, files: [attachment] });
                }
            }

        } catch (err) {
            console.error('[EROARE] Eroare la generarea imaginii de bun venit:', err);
        }
    }
};
