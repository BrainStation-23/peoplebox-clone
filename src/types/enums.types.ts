export type DatabaseEnums = {
  assignment_status: "pending" | "completed" | "expired"
  assignment_type: "individual" | "sbu" | "organization"
  level_status: "active" | "inactive"
  survey_status: "draft" | "published" | "archived"
  user_role: "admin" | "user"
}

export type DatabaseFunctions = {
  is_admin: {
    Args: {
      user_uid: string
    }
    Returns: boolean
  }
}