/**
 * Endpoints 
 */

const Endpoints = {
  Auth: {
    Login: "/api/auth/login/",
    Register: "/api/auth/register/",
    Logout: "/api/auth/logout/",
    Send_mail: "/api/auth/send-mail/",
    Forget_pass: "/api/auth/forget-pass/",
    Change_password: "/api/auth/change-password/",
    FortyTwo: "/api/auth/oauth/42/",
    Google: "/api/auth/oauth/google/",
  },
  Dashboard: {
      Add_achievements:'/api/dash/add-achievements/', 
      Update_achievements:'/api/dash/update-achievements/', 
      My_achievements:'/api/dash/my-achievements/',

      Get_card: '/api/dash/get-card/',
      Search: '/api/dash/search/',
      Edit: '/api/dash/edit/',

      Send_req: '/api/dash/send-req/',
      Cancel: '/api/dash/cancel/', 
      Accept_req: '/api/dash/accept-req/' ,
      Deny_req: '/api/dash/deny-req/',
      Unfriend: '/api/dash/unfriend/', 
      Block: '/api/dash/block/', 
      Unblock: '/api/dash/unblock/',
    
      Buy:'/api/dash/buy/',
      Inventory:'/api/dash/inventory/',
      
      All_relations: '/api/dash/all-relations/',
  }
};

export default Endpoints;