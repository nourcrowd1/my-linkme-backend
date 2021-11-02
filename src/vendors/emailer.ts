import nodemailer from "nodemailer";
import { mailer as config } from "../config";
class Mailer {
    transporter: any;
    constructor() {
        this.buildTransport();
    }


    send(to: string, data: {body:string, subject:string}) : Promise<object> {
        const {body, subject} = data;
        return this.transporter.sendMail({
            from: process.env.MAILER_FROM,
            to,
            html:body,
            subject:subject
        })
            .then(res => {
                return res;
            })
            .catch(err => {
                throw err;
            })

    }

    buildTransport() {
        let transport = {
                host:  config.host,
                port: config.port,
                secure: config.secure, // true for 465, false for other ports
                auth: {
                    user: config.user,
                    pass: config.pass
                }
        };
        this.transporter = nodemailer.createTransport(transport);
    }

}

export default Mailer;