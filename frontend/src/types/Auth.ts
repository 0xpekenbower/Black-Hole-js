/**
 * Auth types 
 */

// Register
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}



// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data?: {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      createdAt: Date;
      avatar: string;
      bio: string;
      background: string;
    }
  } | null;
}

// password reset
export interface VerifyEmailExistRequest {
  email: string;
}


/**
 * true means that user want to get code in email
 */
export interface GetOTPRequest {
  email: string;
}

/**
 * code : indicate response code
 * message : indicate response message
 * data : indicate response data if success or null if failed and then we will use message and code to show to user
 * data.token : indicate token that will be used for validate request (don't have relation with real account token just temporary token to avoid spamming)
 * data.sentto : email that code will be sent to 
 * data.expiresAt : expiration date of the token
 */
export interface GetOTPResponse {
  data?: {
    token: string;
    sentto: string | null; // email that code will be sent to or null if error happen
    expiresAt: Date; // expiration date of the token
  } | null; // if token is null, it means that email is not found in database
}

export interface VerifyOTPRequest {
  token: string; // token f it's will be used for validate request
  code: number; // 6 digits code
}

/**
 * expiration date of the token // 
 * if III request is failed, we will give it 3 times to try and time still the same
 * if III request is success, we will keep the same time except if the remaining time is less than 1 minute in this case we will add 2 minutes to the expiration date so become 3 minutes for change password
 * if III request is failed 3 times, we will block the account for 10 minutes from spamming
 * if III request is success means that email was sent , so if the same ip try to send request from the same device more than 3 times in 2h backend will not send email to avoid google banning us for spamming
 */
export interface VerifyOTPResponse {
  data?: {
    token: string;
    retry: number; // number of retries left in case of failed start with 3 // frontend will only show number backend it's count down to avoid cheating
    expiresAt: Date;  // time remaining to set new password in case of success or enter new otp in case of failed
  } | null; // if token is null, it's means something happen in backend 
}


export interface ChangePasswordRequest {
  newpassword: string;
  token: string;
}

/**
 * in case of success no need for data , but if failed we will send data with token and expiration date
 * failed case can be 
 * 1. wrong format of password
 * 2. token is become invalid or not found
 * 3. something happen in backend like database error or etc
 * 
 * time of expiration will not be changed at this stage and if time expired (case 2) redirect to form of send email and rule of 3 times in 2h will be applied
 */
export interface ChangePasswordResponse {
  data?: {
    token: string;
    expiresAt: Date; // expiration date of the token
  } | null; // if token is null, it's means something happen in backend
}

/**
 * code : indicate response code it's used for all the cases (success or failed) so we expect specific type or ResponseStatus
 * message : indicate response message it's used for all the cases (success or failed)
 * success : indicates whether the request was successful
 */
export interface ResponseStatus {
  code: number;
  message: string;
  success?: boolean;
}



