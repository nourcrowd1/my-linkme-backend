import {SearchAllByDate, Analytics} from "../entities/Analytics";
import {InputError, NotFoundError, NotAuthorizedError} from "../errors";
import {Between} from "typeorm";

import {Like} from "typeorm";
import { isEmpty, find } from "lodash";

import User from "../entities/User";
export default {
    Query: {
            sumByDate: async (
            _,
            {input}: { input: SearchAllByDate },
            { user }: { user: User }
        ): Promise<{count:number}> => {
            if (!user.id) throw new NotAuthorizedError();


            const items =  await Analytics.findByDate(input, user);

            return {count:items.length};
        },

        topLocations: async (
            _,
            {input}: { input: {dateFrom:string, dateTo:string} },
            { user }: { user: User }
        ): Promise<[{country: string, pageView:number, linkClick:number}] | any[]> => {
            if (!user.id) throw new NotAuthorizedError();

            let dbResult = await Analytics.findByDateGroupedByCountry(input, user);
            let result = [];
            for (let index in dbResult) {
                let row = dbResult[index];
                let existing = find(result, {country:row.country});
                if (!existing) {
                    existing = {country: row.country, pageView:0, linkClick:0};
                    result.push(existing);
                }
                if (row.event) existing[row.event] = +row.count

            }

            return result;
        },

        sumByDateGroupedCountry: async (
            _,
            {input}: { input: SearchAllByDate },
            { user }: { user: User }
        ): Promise<any[]> => {
            if (!user.id) throw new NotAuthorizedError();
            const items =  await Analytics.findByDate(input, user);
            let tempResult = {};

            for(let index in items) {
              let item = items[index];
              if (!tempResult[item.country]) tempResult[item.country] = 0;
              tempResult[item.country]++;
            }

            let result = [];
            if (!isEmpty(tempResult)) {
                for(let countryCode in tempResult) {
                    result.push({
                        country:countryCode,
                        count:tempResult[countryCode]
                    })
                }
            }

            return result;
        },
    },
};
