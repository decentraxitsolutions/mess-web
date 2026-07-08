import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async () => {
    try {
        const clerkUser = await currentUser();

        if (!clerkUser) {
            return null;
        }

        let existingUser = await db.user.findUnique({
            where: {
                clerkUserId: clerkUser.id
            },
            include: {
                ownedBusiness: true
            }
        });

        if (existingUser) return existingUser;
        
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "New User"

        const newUser = await db.user.create({
            data: {
                clerkUserId: clerkUser.id,
                email: clerkUser.emailAddresses[0].emailAddress,
                name,
                imageUrl: clerkUser.imageUrl,
            },
            include: {
                ownedBusiness: true
            }
        });

        return newUser;

    } catch (error) {
        console.log(error, error.message)
        return null;
    }
}