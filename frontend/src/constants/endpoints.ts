/**
 * Endpoints 
 */

const Endpoints = {
  Auth: {
    Login: "/auth/login/",
    Register: "/auth/register/",
    Logout: "/auth/logout/",
    Send_mail: "/auth/send-mail/",
    Forget_pass: "/auth/forget-pass/",
    Change_password: "/auth/change-password/",
    FortyTwo: "/auth/oauth/42/",
    Google: "/auth/oauth/google/",
  },
  Dashboard: {
      Add_achievements:'/dash/add-achievements/', 
      Update_achievements:'/dash/update-achievements/', 
      My_achievements:'/dash/my-achievements/',

      Get_card: '/dash/get-card/',
      Search: '/dash/search/',
      Edit: '/dash/edit/',

      Send_req: '/dash/send-req/',
      Cancel: '/dash/cancel/', 
      Accept_req: '/dash/accept-req/' ,
      Deny_req: '/dash/deny-req/',
      Unfriend: '/dash/unfriend/', 
      Block: '/dash/block/', 
      Unblock: '/dash/unblock/',
    
      Buy:'/dash/store/buy/',
      Inventory:'/dash/inventory/',
      
      All_relations: '/dash/all-relations/',
  }
};

export default Endpoints;