import { environment } from "@env/environment";

export const AppConfig = {
    name: environment.name,
    production: environment.production,
    productName: 'First Premier Home Warranty',
    copyrightInfo: 'Copyright &copy; 2023. All rights reserved. ',
    apiBaseUrl: environment.apiBaseUrl,
    useMockServer: environment.useMockServer,
    timestamp: '',
    maintenanceMode: false,
    showClaimAddButton: false,
    userRole:{
        admin:1,
        sales_manager:2,
        sales_representative:3,
        claim_representative:4,
    },
    newYorkTax:8.88,
    apiUrl: {
        //Common
        locationByZip: 'admin/common/location-by-zip',
        common: {
            searchZipcode: 'frontend/common/search-zipcode',
            updateOrgLogo: `admin/system-admin-org/update-logo`,
            updateOrgTinyLogo: `admin/system-admin-org/update-tiny-logo`,
            uniqueValcheck: `admin/common/is-value-unique`,
            getAllIcons: ``
        },

        systemAdmin: {
            // Authentication, JWT Validation
            authenticateSystemAdmin: 'admin/system-admin/login-system-admin',
            validateSystemAdminOTP: 'admin/system-admin/validate-login-otp',
            validateSystemAdminToken: 'admin/system-admin/verify-system-admin-token',
            systemAdminForgotPasswordLink: 'admin/system-admin/gen-forgot-pass-link',
            systemAdminUpdatePassword: 'admin/system-admin/update-password',
            getSystemAdmin: 'admin/system-admin/get-all-system-admin',
            systemAdminLogout: 'admin/system-admin/logout-system-admin',
            resendLoginOtp: `admin/system-admin/resend-login-otp`,
            changProfilePassword: `admin/system-admin/change-profile-password`,

            // SYSTEM ADMIN ORGANIZATIONS
            createOrg: `admin/system-admin-org/create-organizations`,
            updateOrg: `admin/system-admin-org/update-organizations`,
            getAllOrg: `admin/system-admin-org/get-all-organizations`,
            orgUsers: `admin/user/get-all-users`,
            orgToggleActiveStatus: `admin/system-admin-org/toggle-organizations-status`,

            //ORGANIZATION USER ROLES
            getOrgUserRoles: `admin/system-admin-roles/get-all-org-user-roles`,
            createOrgUserRoles: `admin/system-admin-roles/create-user-role`,
            updateOrgUserRoles: `admin/system-admin-roles/update-user-role`,
            toggleOrgUserRoleStatus: 'admin/system-admin-roles/toggle-org-user-roles-status',
            deleteOrgUserRoles: 'admin/system-admin-roles/delete-org-user-role',


            //ORGANIZATION DEPARTMENTS
            getOrgDepartments: `admin/system-admin-departments/get-all-departments`,
            createOrgDepartment: `admin/system-admin-departments/create-department`,
            updateOrgDepartment: `admin/system-admin-departments/update-department`,
            toggleOrgDepartmentStatus: 'admin/system-admin-departments/update-departments-status',
            deleteOrgDepartment: 'admin/system-admin-departments/delete-department',

            //ORGANIZATION USERS
            getOrgUsers: `admin/system-admin/get-all-org-users`,
            createOrgUser: `admin/system-admin/create-org-user`,
            // updateOrgDepartment:`admin/org-departments/update-department`,
            // toggleOrgDepartmentStatus: 'admin/org-departments/update-departments-status',
            // deleteOrgDepartment:'admin/org-departments/delete-org-user-role',

            // SYSTEM ADMIN MODULES
            getSystemAdminModules: 'admin/system-admin-modules/get-all-modules',
            addSystemAdminModule: 'admin/system-admin-modules/create-module',
            updateSystemAdminModule: 'admin/system-admin-modules/update-module',
            toggleSystemAdminModuleStatus: 'admin/system-admin-modules/toggle-module-status',
            deleteSystemAdminModule: 'admin/system-admin-modules/delete-module',

            // SYSTEM ADMIN SUB MODULES        
            getSystemAdminSubModules: 'admin/system-admin-sub-modules/get-all-submodules',
            addSystemAdminSubModule: 'admin/system-admin-sub-modules/create-submodule',
            updateSystemAdminSubModule: 'admin/system-admin-sub-modules/update-submodule',
            toggleSystemAdminSubModuleStatus: 'admin/system-admin-sub-modules/toggle-submodule-status',
            deleteSystemAdminSubModule: 'admin/system-admin-sub-modules/delete-submodule',
            getAllSubModuleGroupByModule: `admin/system-admin-sub-modules/get-all-submodule-groupby-module`,
            // ORGANAIZATION BASED SUBMODULE
            getOrgBySubModulesList: `admin/system-admin-org-permission/get-org-submodules`,

            // SET PERMISSION FOR ORGANAIZATION MODULE SUBMODULE
            setOrgModuleSubModulePermission: `admin/system-admin-org-permission/set-module-submodule`,
        },
        orgAdmin: {
            // Authentication, JWT Validation
            authenticate: 'admin/org-user-auth/login',
            validateOTP: 'admin/org-user-auth/validate-login-otp',
            activateUser: 'admin/org-user-auth/activate-user',
            validateToken: 'admin/org-user-auth/verify-token',
            validateRolePermissions: 'auth/validateRolePermissions',
            updateFogotPassword: 'admin/org-user-auth/update-password',
            genForgotPassLink: `admin/org-user-auth/gen-forgot-pass-link`,
            resendLoginOtp: `admin/org-user-auth/resend-login-otp`,
            changProfilePassword: `admin/org-user-auth/change-profile-password`,

            //ORGANIZATION DEPARTMENTS
            getOrgDepartments: `admin/org-departments/get-all-departments`,
            createOrgDepartment: `admin/org-departments/create-department`,
            updateOrgDepartment: `admin/org-departments/update-department`,
            toggleOrgDepartmentStatus: 'admin/org-departments/update-departments-status',
            deleteOrgDepartment: 'admin/org-departments/delete-department',

            //ORGANIZATION USER ROLES
            getRoles: `admin/roles/get-all-roles`,
            createRoles: `admin/roles/create-role`,
            updateRoles: `admin/roles/update-role`,
            toggleRoleStatus: 'admin/roles/toggle-roles-status',
            deleteRoles: 'admin/roles/delete-role',
            setRolePermission: `admin/roles/set-role-permission`,

            // ORGANAIZATION USER ACCESS PERMISSION

            setOrgUserAccessPermission: `admin/org-user-access-permisiions/set-user-access-permission`,

            //ORGANIZATION USERS
            getOrgUsers: `admin/org-user/get-all-users`,
            getUserById: 'admin/org-user/user-details',
            getOrgUsersList: `admin/org-user/get-all-users-list`,
            getOrgSimpleUsersList: `admin/org-user/get-all-simple-user-list`,
            createOrgUser: `admin/org-user/create-user`,
            updateOrgUser: `admin/org-user/update-user`,
            updateOrgUserProfieImage: `admin/org-user/update-profile-image`,//:org_user_id
            toggleUserStatus: `admin/org-user/toggle-user-active-status`,

            // SUB MODULE
            getAllSubModuleGroupByModule: `admin/submodules/get-all-submodule-groupby-module`,


            // CUSTOMER MANAGEMENT 
            getAllCustomers: `admin/customers/get-all-customers`,
            updateCustomer: `admin/customers/update-customer`,
            toggoleCustomerStatus: `admin/customers/toggle-customer-status`,

            //CUSTOMER DETAILS
            getCustomerDetails: `admin/customers/customer-details`,// :customer_id
            createCustomerPolicyDoc:`admin/customers/create-customer-policy-document`,//:customer_id
            getCustomerPolicyDocList:`admin/customers/get-customer-policy-documents`,//:customer_id
            createCustomerPolicyNote:`admin/customers/create-customer-policy-note`,//:customer_id
            getCustomerPolicyNote:`admin/customers/get-customer-policy-notes`,//:customer_id
            getCustomerAuditTrail:`admin/audit-trail/get-customer-audit`,//:customer_id

            //SALESMAN DETAILS
            getSalesmanDetails: `admin/salesman/salesman-details`,// :org_user_id
           

            //PROFILE
            updateProfileInfo: `admin/org-user/update-profile-info`,
            updateProfilePhoto: `admin/org-user/update-profile-photo`,

        },
        products: {
            getAllProducts: 'admin/products/get-all-products',
            getAllProductsProblems: 'admin/product-problem/get-all-products-problem',
            createProduct: 'admin/products/create-product',
            updateProduct: 'admin/products/update-product',
            deleteProduct: 'admin/products/delete-product',
            updateProductImage: 'admin/products/upload-product-image',
            deleteExistingImage: 'admin/products/delete-existing-image',
            toggleProductStatus: 'admin/products/toggle-product-status'
        },
        plans: {
            getAllPlans: 'admin/plans/get-all-plans',
            createPlan: 'admin/plans/create-plan',
            updatePlan: 'admin/plans/update-plan',
            deletePlan: 'admin/plans/delete-plan',
            togglePlanStatus: 'admin/plans/toggle-plan-status'
        },
        plansterms: {
            getAllPlans: 'admin/plans/get-all-plans',
            getAllPlanTerms: 'admin/plan-terms/get-all-plan-terms',
            getPlanTerms: 'admin/plan-terms/get-plan-terms',
            createPlanTerms: 'admin/plan-terms/create-plan-terms',
            updatePlanTerms: 'admin/plan-terms/update-plan-terms',
            deletePlanTerms: 'admin/plan-terms/delete-plan-terms',
            togglePlanTermsStatus: 'admin/plan-terms/toggle-plan-terms-status',
            getAllPropertyTypes: 'admin/plan-terms/get-property-type',
        },
        termsMaster: {
            getAllTerms: 'admin/terms-master/get-all-terms',
            createTerm: 'admin/terms-master/create-term',
            updateTerm: 'admin/terms-master/update-term',
            deleteTerm: 'admin/terms-master/delete-term',
            toggleTermStatus: 'admin/terms-master/toggle-term-status',
        },
        serviceCallFees:{
            getAllServiceCallfees:`admin/service-call/get-service-call`,
            createScf:`admin/service-call/create-scf`,
            updateScfSatus:`admin/service-call/update-scf-status`
        },
        renewalStatusMaster: {
            getAllRenewalStatus: 'admin/renewal-status-master/get-all-status',
            createRenewalStatus: 'admin/renewal-status-master/create',
            updateRenewalStatus: 'admin/renewal-status-master/update',
            deleteRenewalStatus: 'admin/renewal-status-master/delete',
            toggleRenewalStatus: 'admin/renewal-status-master/toggle-status',
        },
        blogs: {
            createPost: 'admin/blogs/create-post',
            updatePost: 'admin/blogs/update-post',
            getAllPosts: 'admin/blogs/get-all-posts',
            getAllBlogCategories: 'admin/blogs/get-all-blog-categories',
            updateAuthorImage: 'admin/blogs/upload-author-image',
            updateBlogImage: 'admin/blogs/upload-blog-image',
            deleteExistingImage: 'admin/blogs/delete-existing-image',
            uploadDescriptionImage: 'admin/blogs/upload-blog-description-image',
            toggleActiveStatus: 'admin/blogs/toggle-post-status',
            deletePost: 'admin/blogs/delete-post'
        },
        marketLeaders: {
            createMarketLeader: 'admin/market-leaders/create-market-leader',
            updateMarketLeader: 'admin/market-leaders/update-market-leader',
            getAllMarketLeaders: 'admin/market-leaders/get-all-market-leaders',           
            updateImage: 'admin/market-leaders/upload-market-leader-image',
            deleteExistingImage: 'admin/market-leaders/delete-existing-image',
            toggleActiveStatus: 'admin/market-leaders/toggle-market-leader-status',
            deleteMarketLeader: 'admin/market-leaders/delete-market-leader'
        },
        payments: {
            getCustomerAllPayments: 'admin/payments/get-customer-payments',//:customer_id
            getAllPayments: 'admin/payments/get-all-payments',
            getAllFailedPayments: 'admin/payments/get-all-failed-payments',
            updatePayment: `admin/payments/update-payment`,// :payment_id
            retryFailedPayment: `admin/payments/retry-failed-payment`,// :payment_id
            removeEscrowPayment: `admin/payments/delete-payment`// :payment_id
        },
        commissions: {
            getAllCommissionTypes: 'admin/commissions/get-all-commission-types',
            createCommissionType: 'admin/commissions/create-commission-type',
            deleteCommissionType: 'admin/commissions/delete-commission-type',
            toggleActiveStatus: 'admin/commissions/toggle-commission-type-status',
            toggleActiveCommissionStatus: 'admin/commissions/toggle-policy-wise-commission-status',
            updateCommissionType: 'admin/commissions/update-commission-type',
            getRelaventCommission: `admin/commissions/get-relavent-commission`

        },
        salesCommissions: {
            getAllSalesCommissions: 'admin/commissions/get-all-sales-commission',
            updateSalesCommission: 'admin/commissions/update-sales-commission',
        },
        customerCards:{
            getCustomerAllSavedCardList:`admin/customer-card/get-all-cards`,//:customer_id
            updateCustomerPrimaryCard:`admin/customer-card/update-primary-card`,//:customer_card_id
            updateCustomerCardInactive:`admin/customer-card/update-card-inactive-status`,//:customer_card_id
            createCustomerCard:`admin/customer-card/create-card`,//:customer_card_id
            deleteCustomerCard:`admin/customer-card/delete-card`,//:customer_card_id
        },
        whitelistips: {
            getAllWhitelistIps: 'admin/whitelist-ips/get-all-whitelistip',
            createWhitelistIp: 'admin/whitelist-ips/create-whitelist-ip',
            deleteWhitelistIp: 'admin/whitelist-ips/delete-ip-address',
            updateWhitelistIp: 'admin/whitelist-ips/update-ip-address',
            toggleIPAddressStatus: 'admin/whitelist-ips/toggle-ip-address-status'
        },
        referfriend: {
            getAllReferFriend: 'admin/refer-friends/get-refer-friends',
        },
        brands: {
            getAllBrands: 'admin/brands/get-product-brands',
            createProductBrand: 'admin/brands/create-product-brand',
            updateProductBrandStatus: 'admin/brands/update-product-brand-status',
            deleteBrand: 'admin/brands/delete-brand',
        },
        priority: {
            getAllPriority: 'admin/priority/get-claim-priority',
            createPriority: 'admin/priority/create-claim-priority',
            updatePriorityStatus: 'admin/priority/update-priority-status',
            deletePriority: 'admin/priority/delete-claim-priority',
        },
        policyStatus: {
            getPolicyStatusList: 'admin/policy-status/list',
            createPolicyStatus: 'admin/policy-status/save',
            updatePolicyStatus: 'admin/policy-status/update',
            deletePolicyStatus: 'admin/policy-status/delete',
        },
        claimStatus: {
            getClaimStatusList: 'admin/claim-status/list',
            createClaimStatus: 'admin/claim-status/save',
            updateClaimStatus: 'admin/claim-status/update',
            deleteClaimStatus: 'admin/claim-status/delete',
        },
        paymentStatus: {
            getPaymentStatusList: 'admin/payment-status/list',
            createPaymentStatus: 'admin/payment-status/save',
            updatePaymentStatus: 'admin/payment-status/update',
            deletePaymentStatus: 'admin/payment-status/delete',
        },
        propertySize: {
            getPropertySizeList: 'admin/property-size/list',
            createPropertySize: 'admin/property-size/save',
            updatePropertySize: 'admin/property-size/update',
            deletePropertySize: 'admin/property-size/delete',
        },
        holding: {
            getAllHoldingPeriod: 'admin/holding/get-holding-periods',
            createHoldingPeriod: 'admin/holding/create-holding-period',
            updateHoldingPeriodStatus: 'admin/holding/update-holding-period-status',
            deleteHoldingPeriod: 'admin/holding/delete-holding-period',
        },
        property: {
            getAllPropertyType: 'admin/property/get-property-types',
            createPropertyType: 'admin/property/create-property-type',
            updatePropertyTypeStatus: 'admin/property/update-property-type-status',
            deletePropertyType: 'admin/property/delete-property-type',
        },
        
        zipCode: {
            getAllZipCode: 'admin/zip-code/get-all-zip-code',
            updateZipCode:'admin/zip-code/update-zip-code',
            createZipCode:'admin/zip-code/create-zip-code',
            deleteZipCode:'',
            toggleZipCodeStatus:'admin/zip-code/toggle-zip-code-status'
        },
        policy: {
            getAllPolicies: 'admin/policy/get-all-policy',
            getAllRenewalPolicies: 'admin/policy/get-all-renewal-policy',
            createPolicy:`admin/policy/create-policy`,
            getPolicyDetails:`admin/policy/policy-details`,//:policy_id
            updatePolicy:`admin/policy/update-policy`,//:policy_id
            markAsPolicy:`admin/policy/mark-policy-anamaly`,//:policy_id
            renewPolicy:`admin/policy/renew-policy`,//:policy_id
            updatePolicyRenewalStatus:`admin/policy/update-renew-policy-status`,//:policy_id
            generateEscrowInvoice:`admin/policy/escrow-invoice-generate`,//:policy_id
            generatePaymentReceipt:`admin/policy/payment-receipt-generate`,//:policy_id
            getAllStatusAndPaymentType:`admin/policy/get-advance-search-data`
        },
        
        dashboard: {
            getDashboardDetails: 'admin/dashboard/get-dashboard-details',
            getDashboardCockpit: 'admin/dashboard/get-dashboard-cockpit',
            getServiceRequest: 'admin/dashboard/get-service-request',
            getRevenueData: 'admin/dashboard/get-revenue-data',
            getTopFiveStateSales: 'admin/dashboard/get-top5-state-sales',
            getWebsiteVsBackend: 'admin/dashboard/get-website-vs-backend',
        },
        policyNoteTask: {
            getPolicyTask: 'admin/policy-note/get-policy-tasks',
            getPolicyTaskByPolicyId:`admin/policy-note/get-policy-task-by-policy-info`//:policy_id
        },
        affiliates: {
            getAllAffiliates: 'admin/affiliates/get-all-affiliates',
        },
        careers: {
            getAllCareer: 'admin/careers/get-all-career',
        },
        contacts: {
            getAllContacts: 'admin/contacts/get-all-contacts',
        },
        contractors: {
            getAllContractors: 'admin/contractors/get-all-contractors',
            assignJob: 'admin/contractors/assign-job',//contractor_id
            contractorAssignJob: 'admin/contractors/contractor-assign-job',//contractor_id
            updateContractor: 'admin/contractors/update',
            uploadLicense: 'admin/contractors/upload-license',
            updateActive: 'admin/contractors/update-active-status',
        },
        realEstate: {
            getAllRealEstateProfessionals: 'admin/real-estate-professionals/get-all-realestateProfessionals',
            getRealEstateProfessionalsDetails: 'admin/real-estate-professionals/get-realtor-details',//:realtor_id,
            toggleActiveStatus: 'admin/real-estate-professionals/toggle-realtor-status' ,
        },
        pageSeo:{
            createPageSeo:`admin/page-seo/create-page-seo`,
            updatePageSeo:`admin/page-seo/update-page-seo`,//:PageSeo_id
            getAllPageSEO:`admin/page-seo/get-all-page-seo`,
            deletePageSEO: 'admin/page-seo/delete-page-seo',
            togglePageSEOStatus:'admin/page-seo/toggle-seo-status'
        },
        planTermDiscount:{
            createPlanTermDiscount:`admin/plan-term-discounts/create-plan-term-discount`,
            updatePlanTermDiscount:`admin/plan-term-discounts/update-plan-term-discount`,//:PageSeo_id
            getAllPlanTermDiscounts:`admin/plan-term-discounts/get-all-plan-term-discounts`,
            deletePlanTermDiscount: 'admin/plan-term-discounts/delete-plan-term-discounts',
            togglePlanTermDiscountStatus:'admin/plan-term-discounts/toggle-plan-term-discount'
        },
        websitePages: {
            getAllWebsitePages: 'admin/website-pages/get-all-pages',
        },

        customerReviews: {
            createReview: 'admin/customer-reviews/create-review',
            updateReview: 'admin/customer-reviews/update-review',
            getAllReviews: 'admin/customer-reviews/get-all-reviews',
            deleteReview: 'admin/customer-reviews/delete-review',
        },

        claims:{
            createClaim:`admin/claims/create-claim`,
            updateClaim:`admin/claims/update-claim`,//:claim_id
            getAllClaims:`admin/claims/get-all-claims`,
            getAllClaimTicketStatuses:`admin/claims/get-all-claim-ticket-status`,
            getClaimDetails:`admin/claims/get-claim-details`,// :claim_id
        },


        productProblems:{
            getAllProductProblems:`admin/product-problem/get-all-products-problem`,
            createProductProblems:`admin/product-problem/create-product-problem`
        },

        // CMS
        dashboardStat: 'cms/getDashboardStat',
        getPosts: 'cms/getPosts',
        getHolidays: 'cms/getHolidays',
        addPost: 'cms/createPost',
        updatePost: 'cms/updatePost',
        deletePost: 'cms/deletePost',
        getContentCalendar: 'cms/getCalendar',
        addContentCalendar: 'cms/addCalendar',
        editContentCalendar: 'cms/editCalendar',
        deleteContentCalendar: 'cms/deleteCalendar',
        addHoliday: 'cms/addHoliday',
        updateHoliday: 'cms/updateHoliday',
        deleteHoliday: 'cms/deleteHoliday',
        getEvents: 'cms/getEvents',
        // User
        getUsers: 'admin/user/get-all-users',
        getUserById: 'admin/user/user-details',
        userFormData: 'user/userFormData',
        getRoles: 'admin/role/get-all-roles',
        deleteUser: 'admin/user/delete-user',
        addUser: 'admin/user/create-user',
        updateUser: 'admin/user/update-user',
        logout: 'admin/org-user/logout',


        // Customer
        getCustomers: 'admin/customer/get-all-customers',
        sendCustomerWelcomeMail: 'admin/customers/resened-welcome-mail',// :customer_id
        getCustomerById: 'admin/customer/customer-details',
        deleteCustomer: 'admin/customer/delete-customer',
        addCustomer: 'admin/customer/create-customer',
        updateCustomer: 'admin/customer/update-customer',

        updateUserStatus: 'user/updateUserStatus',
        userDropdown: 'user/userDropdown',
        searchUser: 'user/search',
        approvers: 'user/approvers',
        changeApprovers: 'user/changeApprovers',
        getEmployees: 'user/getEmp',
        getReportees: 'user/getReportees',
        saveLeaveBalance: 'user/saveLeaveBalance',
        userInsight: 'user/userInsight',


        // Plans
        getPlans: 'admin/plans/get-plans',



        // Items
        getItems: 'admin/items/get-all-items',
        addItem: 'admin/items/create-item',
        updateItem: 'admin/items/update-item',
        getItemById: 'admin/items/item-details',


        // Addon Category
        getAddonCategory: 'admin/addon-categories/get-all-addon-categories',
        getAddonCategoryById: 'admin/addon-categories/addon-category-details',
        createAddonCategory: 'admin/addon-categories/create-addon-category',
        updateAddonCategory: 'admin/addon-categories/update-addon-category',

        // Academic
        academicFormData: 'academic/formData',
        getEducation: 'academic/getAcademicRecord',
        addEducation: 'academic/createAcademicRecord',
        updateEducation: 'academic/updateAcademicRecord',
        deleteEducation: 'academic/deleteAcademicRecord',

        // Work Experience
        experienceFormData: 'workexperience/formData',
        getExperience: 'workexperience/getExperience',
        addExperience: 'workexperience/createExperience',
        updateExperience: 'workexperience/updateExperience',
        deleteExperience: 'workexperience/deleteExperience',

        // Payroll
        payrollFormData: 'payroll/formData',
        getPayroll: 'payroll/getPayroll',
        addPayroll: 'payroll/createPayroll',
        updatePayroll: 'payroll/updatePayroll',
        deletePayroll: 'payroll/deletePayroll',

        // Emergency Contact
        emergencyContactFormData: 'contact/formData',
        getEmergencyContact: 'contact/getContact',
        addEmergencyContact: 'contact/createContact',
        updateEmergencyContact: 'contact/updateContact',
        deleteEmergencyContact: 'contact/deleteContact',

        // Timesheet
        timesheetFormData: 'timesheet/formData',
        getTimesheet: 'timesheet/getTimesheet',
        addTimesheet: 'timesheet/createTimesheet',
        updateTimesheet: 'timesheet/updateTimesheet',
        deleteTimesheet: 'timesheet/deleteTimesheet',
        timesheetReport: 'timesheet/getReport',

        // Project Timesheet
        projectDropdown: 'project/projectDropdown',
        getProject: 'project/getProject',
        addProject: 'project/createProject',
        updateProject: 'project/updateProject',
        deleteProject: 'project/deleteProject',
        timesheetChartData: 'timesheet/timesheetChartData',

        // Timesheet Project Tasks
        taskFormData: 'task/formData',
        getTask: 'task/getTask',
        addTask: 'task/createTask',
        updateTask: 'task/updateTask',
        deleteTask: 'task/deleteTask',

        // Leave Management
        getLeaves: 'leave/getLeave',
        applyLeave: 'leave/createLeave',
        updateLeave: 'leave/updateLeave',
        getLeaveFormData: 'leave/getLeaveFormData',
        getEmpLeaveBalance: 'leave/getEmpLeaveBalance',
        uploadLeaveData: 'leave/uploadLeaveData',

        //Settings
        getSettings: 'settings/getSiteSettings',
        updateSiteSettings: 'settings/updateSiteSettings'
    }
};