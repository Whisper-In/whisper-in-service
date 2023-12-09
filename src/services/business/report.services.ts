import { ReportReason } from "../../models/profile/report-reason.model";
import nodeMailer from "nodemailer";
import { UserProfile } from "../../models/user/user-profile.model";
import { isFulfilled } from "../../utils/promise";
import { nodeMailerHost, nodeMailerPass, nodeMailerPort, nodeMailerReceiver, nodeMailerUser } from "../../config/app.config";
import Mail from "nodemailer/lib/mailer/index";

export const getReportReasons = async () => {
    try {
        const result = await ReportReason.find();

        return result;
    } catch (error) {
        throw error;
    }
};

export const sendReport = async (userId: string, aiProfileId: string, reportReasonCode: string) => {
    try {
        const reportReasonQuery = ReportReason.findOne({ reportReasonCode })
        const userQuery = UserProfile.findOne({ _id: userId });
        const aiProfileQuery = UserProfile.findOne({ _id: aiProfileId });

        const results = await Promise.allSettled([
            reportReasonQuery,
            userQuery,
            aiProfileQuery
        ]);

        const reportReason = isFulfilled(results[0]) ? results[0].value : undefined;
        const user = isFulfilled(results[1]) ? results[1].value : undefined;
        const aiProfile = isFulfilled(results[2]) ? results[2].value : undefined;
        
        if (reportReason && user && aiProfile) {
            const text = `${user.email}(${userId}) reported ${aiProfile.name}'s(${aiProfileId}) profile for ${reportReason.reportReasonDescription}.`;

            const transporter = nodeMailer.createTransport({
                port: Number.parseInt(nodeMailerPort),                
                host: nodeMailerHost,
                auth: {
                    user: nodeMailerUser,
                    pass: nodeMailerPass
                },
                secure: true,
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailData: Mail.Options = {
                from: nodeMailerUser,
                to: nodeMailerReceiver,
                subject: `User Report on ${aiProfile.name}'s Profile`,
                text,
                html: `Hey Admin,<br><b>${user.email}(${userId})<b> reported <b>${aiProfile.name}'s(${aiProfileId})<b> profile for ${reportReason.reportReasonDescription}.`
            }

            transporter.sendMail(mailData, (error, response) => {
                if (error) {
                    throw error;
                } else {
                    return response;
                }
            });
        } else {
            if (!reportReason) {
                throw "Invalid report reason.";
            } else if (!user) {
                throw "No user found.";
            } else if (!aiProfile) {
                throw "Invalid reported profile.";
            }
        }
    } catch (error) {
        throw error;
    }
}