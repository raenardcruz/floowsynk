package DB

var adminUser = UsersModel{
	ID:       "b5bd8424-fb52-4454-8102-488959a41ca8",
	Username: AppConfig.App_Admin_Username,
	Password: AppConfig.App_Admin_Password,
	Role:     UserRoleAdmin,
}
