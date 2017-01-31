/*
*/

var TokenHandler = function()
{
    this.valid_tokens = {
        sample: {           // DO NOT USE IN DEPLOY
            asdasd: 100, // "milestone" 1
            dasaqf: 200, // "milestone" 2
            qwerty: 300  // "milestone" 3
            //etc....
        },
        planets_orb: {
            B5BSM1: 0,
            L2G2MC: 0,
            AXZE12: 0,
            N7C7ZL: 0,
            A6NQS9: 0,
            XG62MS: 0,
            B655Q7: 0,
            H7464R: 0
        },
        deadly_exhaust_war: {
            SJ9721: 0,
            L7K5N5: 0,
            ER92Y3: 0,
            S5HGCD: 0,
            S41578: 0,
            FEOEI4: 0,
            SPVHS6: 0,
            HA5H4G: 0

        },
        space_terra: {
            Q1JEC1: 0,
            O2Y9S5: 0,
            A61H4T: 0,
            V349R0: 0,
            UI95KL: 0,
            E55K22: 0,
            OKVE2Z: 0,
            O18R20: 0 
        },
        auction_it: {
            P9S2FJ: 0,
            XD5H12: 0,
            BD1VYB: 0,
            HFD07K: 0,
            BU9KA0: 0,
            IEDC1M: 0,
            I6Q005: 0,
            QP91I5: 0
        },
        virtual_stock_market: {
            A02GM0: 0,
            E0DA0D: 0,
            P7JX4K: 0,
            XS5530: 0,
            LI1L04: 0,
            T38340: 0,
            L35J95: 0,
            O8094M: 0
        },
        online_treasure_hunt: {
            T61G47: 0,
            TM612K: 0,
            Z3DA9L: 0,
            PDV2I2: 0,
            H78968: 0,
            KYF50D: 0,
            IC8007: 0,
            TDH2F9: 0

        },
        do_or_die: {
            Z0XRWX: 0,
            EIMPF9: 0,
            I8894E: 0,
            K42K16: 0,
            E41GPT: 0,
            BBZABM: 0,
            R67941: 0,
            Y63Y48: 0

        },
        terraverse: {
            OVT4Q5: 0,
            P55KZJ: 0,
            BG328B: 0,
            P7ENJ9: 0,
            Q9Q4RG: 0,
            W0PMFR: 0,
            DSFGRY: 0,
            RGRTOK: 0 
        }
    }

    this.fetchFor = function(game,token)
    {
        if (this.valid_tokens[game][token] !== undefined && this.valid_tokens[game][token] !== null)
        {
            return(this.valid_tokens[game][token]);
        }
        else
        {
            return(0);
        }
    };

    this.changeValueFor = function(game,token,new_value)
    {
        if (this.valid_tokens[game][token] !== undefined && this.valid_tokens[game][token] !== null)
        {
            this.valid_tokens[game][token] = new_value;
            return(true);
        }
        else
        {
            return(false);
        }
    }
}

module.exports = TokenHandler;

// TESTING
var handler = new TokenHandler();
console.log(handler.fetchFor("sample","asdasd"));

/*
:: /send/:game/:token
-> /send/sample/asdasd

valid_tokens.game.asdasd
*/