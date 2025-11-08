import { betterAuth } from "better-auth"

export const auth = betterAuth({

    emailAndPassword: {    
        enabled: true
    }, 
    trustedOrigins:["http://localhost:3001"]
})