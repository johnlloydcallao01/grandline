/**
 * Create John Admin User Cloud Function
 *
 * A callable function to create the specific admin user requested:
 * Email: john@encreasl.com
 * Password: @Iamachessgrandmaster23
 * Role: Admin
 */
export declare const createJohnAdmin: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    message: string;
    user: {
        uid: string;
        email: string;
        displayName: string;
        role: any;
    };
}>>;
//# sourceMappingURL=createJohnAdmin.d.ts.map