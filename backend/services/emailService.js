const nodemailer = require('nodemailer');
const { User } = require('../db/db');

const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const emailService = {
    transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }),

    async sendEmail(to, subject, htmlContent) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html: htmlContent,
                text: htmlContent.replace(/<[^>]*>/g, '')
            });
            console.log('Email sent successfully:', info.response);
            return true;
        } catch (error) {
            console.error('Email sending failed:', error.message);
            return false;
        }
    },

    async sendWelcomeEmail(user) {
        const username = user.username || user.email.split('@')[0];
        return this.sendEmail(
            user.email,
            'Welcome to CampusHub!',
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h1 style="color: #4a6ee0; text-align: center;">Welcome to CampusHub!</h1>
                <p style="font-size: 16px; line-height: 1.5;">Hey <strong>${username}</strong>!</p>
                <p style="font-size: 16px; line-height: 1.5;">Welcome to CampusHub, your destination for campus events.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${frontendUrl}" style="background-color: #4a6ee0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit CampusHub</a>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Happy exploring!</p>
                <p style="font-size: 16px; line-height: 1.5;"><strong>Team CampusHub</strong></p>
            </div>`
        );
    },

    async sendEventRegistrationEmail(event, user) {
        const username = user.username || user.email.split('@')[0];
        return this.sendEmail(
            user.email,
            `You're Registered: ${event.title}!`,
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h1 style="color: #4a6ee0; text-align: center;">You're Registered!</h1>
                <p style="font-size: 16px; line-height: 1.5;">Hey <strong>${username}</strong>!</p>
                <p style="font-size: 16px; line-height: 1.5;">You successfully registered for <strong>${event.title}</strong>.</p>
                <div style="background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${frontendUrl}" style="background-color: #4a6ee0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Event Details</a>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">Cheers,<br><strong>Team CampusHub</strong></p>
            </div>`
        );
    },

    async sendEventNotification(event) {
        const users = await User.find().select('email');
        if (!users.length) return;

        return this.sendEmail(
            users.map(user => user.email).join(', '),
            `New Event: ${event.title}!`,
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h1 style="color: #4a6ee0; text-align: center;">New Event Alert!</h1>
                <p style="font-size: 16px; line-height: 1.5;">A new event, <strong>${event.title}</strong>, is happening soon.</p>
                <div style="background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${frontendUrl}" style="background-color: #4a6ee0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Register Now</a>
                </div>
                <p style="font-size: 16px; line-height: 1.5;">See you there!<br><strong>Team CampusHub</strong></p>
            </div>`
        );
    }
};

module.exports = emailService;
