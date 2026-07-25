const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'AutoFormatter',

    async handleMessage(message) {
        if (message.author.bot) return; // nu formata mesajele botului

        // Numele canalelor pe care dorim auto-formatarea
        const formatChannels = [
            'comunicat-de-presa', 'cod-penal', 'regulament-politie', 
            'anunturi-staff', 'anunturi-importante', 'anunturi-politie', 
            'anunturi-medici', 'anunturi-mecanici'
        ];
        
        if (formatChannels.some(name => message.channel.name.includes(name))) {
            await message.delete().catch(() => {});

            // Determinam fisierul imaginii in functie de canal
            const fs = require('fs');
            const path = require('path');
            const { AttachmentBuilder } = require('discord.js');
            
            let imagePath = null;
            let embedColor = '#2980b9'; // Default Blue

            const chanName = message.channel.name.toLowerCase();
            const parentName = message.channel.parent ? message.channel.parent.name.toLowerCase() : '';

            // Verificam atat numele canalului cat si categoria din care face parte!
            if (chanName.includes('politie') || chanName.includes('cod-penal') || parentName.includes('politi')) {
                imagePath = path.join(__dirname, '..', 'assets', 'politie.jpg');
                embedColor = '#3498db'; // Albastru Politie
            } else if (chanName.includes('medic') || parentName.includes('medic')) {
                imagePath = path.join(__dirname, '..', 'assets', 'medici.jpg');
                embedColor = '#e74c3c'; // Rosu Medici
            } else if (chanName.includes('mecanic') || parentName.includes('mecanic')) {
                imagePath = path.join(__dirname, '..', 'assets', 'mecanici.jpg');
                embedColor = '#e67e22'; // Portocaliu Mecanici
            }

            const embed = new EmbedBuilder()
                .setColor(embedColor)
                .setAuthor({ name: `${message.author.username} - Oficial`, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content)
                .setTimestamp();
            
            const filesToSend = [];

            // Adaugam logo-ul factiunii daca exista fisierul local
            if (imagePath && fs.existsSync(imagePath)) {
                const attachment = new AttachmentBuilder(imagePath, { name: 'logo.jpg' });
                embed.setThumbnail('attachment://logo.jpg');
                filesToSend.push(attachment);
            }

            // Atasam poze daca exista in mesajul original
            if (message.attachments.size > 0) {
                const img = message.attachments.first();
                if (img.contentType && img.contentType.startsWith('image/')) {
                    embed.setImage(img.url);
                }
            }

            await message.channel.send({ embeds: [embed], files: filesToSend });
        }
    }
};
