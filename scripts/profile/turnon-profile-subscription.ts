import { connect } from "mongoose";
import { mongoDBConnectionString } from "../../src/config/app.config";
import { UserProfile } from "../../src/models/user/user-profile.model";
import { BusinessConfig } from "../../src/models/business/business-configs.model";

const turnOnProfileSubscriptions = async () => {
    try {
        await connect(mongoDBConnectionString as string);

        const profiles = await UserProfile.find({});
        const minSubscriptionFee = await BusinessConfig.findOne({
            configName: "MIN_SUBSCRIPTION_FEE"
        });

        for (const profile of profiles) {
            const isTurnOn = Math.random() >= 0.5;
            if (isTurnOn) {
                await profile.updateOne({
                    isSubscriptionOn: true,
                    priceTiers: [{
                        features: [],
                        price: Math.floor(Math.random() * 20 + parseInt(minSubscriptionFee?.configValue || '0')),
                        tier: 0
                    }]
                });
            } else {
                await profile.updateOne({
                    isSubscriptionOn: false,
                    priceTiers: []
                });
            }

            console.log(`${profile.userName} subsription: ${isTurnOn ? 'ON' : 'OFF'}`)
        }

    } catch (error) {
        throw error;
    }
}

turnOnProfileSubscriptions();