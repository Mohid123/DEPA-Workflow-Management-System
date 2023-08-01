export const emailLoginForm: any = {
  "title": "Login Form",
  "components": [
    {
      "label": "Email",
      "tableView": true,
      "validate": {
          "required": true,
          "customMessage": "A valid email is required"
      },
      "key": "email",
      "type": "email",
      "input": true
    },
    {
      "label": "Password",
      "showCharCount": true,
      "tableView": false,
      "validate": {
          "required": true,
          "minLength": 8
      },
      "key": "password",
      "type": "password",
      "input": true,
      "protected": true
    },
    {
      "label": "Login",
      "showValidations": false,
      "disableOnInvalid": true,
      "tableView": false,
      "key": "submit",
      "type": "button",
      "input": true,
      "saveOnEnter": true
    }
  ]
};

export const activeDirectoryLoginForm = {
  "title": "Login Form",
    "components": [
      {
        "label": "Username",
        "tableView": true,
        "validate": {
          "required": true,
          "customMessage": "Username is required"
        },
        "key": "username",
        "type": "textfield",
        "input": true
      },
      {
        "label": "Password",
        "showCharCount": true,
        "tableView": false,
        "validate": {
            "required": true,
            "minLength": 8
        },
        "key": "password",
        "type": "password",
        "input": true,
        "protected": true
      },
      {
        "label": "Login",
        "showValidations": false,
        "disableOnInvalid": true,
        "tableView": false,
        "key": "submit",
        "type": "button",
        "input": true,
        "saveOnEnter": true
      }
    ]
}

export const createModuleDetailsForm = {
  "title": "Module details form",
  "components": [
    {
      "label": "Module Title",
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "moduleTitle",
      "type": "textfield",
      "input": true
    },
    {
      "label": "Module URL",
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "moduleUrl",
      "type": "url",
      "input": true
    },
    {
      "label": "Description",
      "autoExpand": false,
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "description",
      "type": "textarea",
      "input": true
    },
    {
      "label": "Code",
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "code",
      "type": "textfield",
      "input": true
    },
    {
      "label": "Proceed to Default Workflow",
      "showValidations": false,
      "customClass": "flex justify-end",
      "tableView": false,
      "key": "proceedToDefaultWorkflow",
      "type": "button",
      "input": true,
      "saveOnEnter": false,
      "disableOnInvalid": true
    }
  ]
}

export const workflowForm = {
  "title": "Workflow Form",
  "components": [
    {
        "label": "Add Default Workflow",
        "columns": [
          {
            "components": [
              {
                "type": "select",
                "label": "Approvers",
                "key": "approvers",
                "data": {
                  "values": [
                    {
                      "value": "raindropsOnRoses",
                      "label": "Raindrops on roses"
                    },
                    {
                      "value": "whiskersOnKittens",
                      "label": "Whiskers on Kittens"
                    },
                    {
                      "value": "brightCopperKettles",
                      "label": "Bright Copper Kettles"
                    },
                    {
                      "value": "warmWoolenMittens",
                      "label": "Warm Woolen Mittens"
                    }
                  ]
                },
                "dataSrc": "values",
                "template": "<span>{{ item.label }}</span>",
                "multiple": true,
                "input": true
              }
            ],
            "width": 6,
            "offset": 0,
            "push": 0,
            "pull": 0,
            "size": "md",
            "currentWidth": 6
          },
          {
            "components": [
              {
                "label": "Condition",
                "widget": "html5",
                "tableView": true,
                "data": {
                  "values": [
                      {
                          "label": "OR",
                          "value": "or"
                      },
                      {
                          "label": "AND",
                          "value": "and"
                      },
                      {
                          "label": "ANY",
                          "value": "any"
                      }
                    ]
                  },
                  "key": "condition",
                  "type": "select",
                  "input": true
              }
            ],
            "width": 6,
            "offset": 0,
            "push": 0,
            "pull": 0,
            "size": "md",
            "currentWidth": 6
          }
        ],
      "key": "addDefaultWorkflow",
      "type": "columns",
      "input": false,
      "tableView": false
    },
    {
      "label": "Proceed to Module Graphics",
      "showValidations": false,
      "customClass": "flex justify-end",
      "tableView": false,
      "key": "proceedToModuleGraphics",
      "type": "button",
      "disableOnInvalid": true,
      "saveOnEnter": false,
      "input": true
    }
  ]
};

export const subModuleForm = {
  "title": "Submodule Form",
  "components": [
    {
      "label": "Submodule Url",
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "submoduleUrl",
      "type": "url",
      "input": true
    },
    {
      "label": "Company Name",
      "widget": "html5",
      "tableView": true,
      "validate": {
        "required": true
      },
      "key": "companyName",
      "type": "select",
      "data": {
        "values": []
      },
      "input": true
    },
    {
      "label": "Code",
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "code",
      "type": "textfield",
      "input": true
  },
  ]
}

export const userAddForm = {
  "title": "User Form",
  "key": "user-form",
  "display": "form",
  "components": [
      {
        "label": "Role",
        "widget": "choicesjs",
        "tableView": true,
        "validate": {
          "required": true
        },
        "data": {
          "values": [
              {
                  "label": "Admin",
                  "value": "admin"
              },
              {
                  "label": "User",
                  "value": "user"
              },
              {
                "label": "Any",
                "value": "any"
              }
            ]
          },
          "key": "role",
          "type": "select",
          "input": true,
          "multiple": true
      }
  ]
}

export const userAddFormProfile = {
  "title": "User Form",
  "key": "user-form",
  "display": "form",
  "components": [
      {
          "label": "Full Name",
          "tableView": true,
          "key": "fullname",
          "type": "textfield",
          "input": true,
          "validate": {
            "required": true
          },
      },
      {
          "label": "Email",
          "tableView": true,
          "key": "email",
          "type": "email",
          "validate": {
            "required": true
          },
          "input": true
      },
      {
          "label": "Roles",
          "widget": "choicesjs",
          "tableView": true,
          "disabled": true,
          "validate": {
            "required": true
          },
          "data": {
              "values": [
                  {
                      "label": "Admin",
                      "value": "admin"
                  },
                  {
                      "label": "User",
                      "value": "user"
                  },
                  {
                    "label": "Any",
                    "value": "any"
                  }
              ]
          },
          "key": "roles",
          "type": "select",
          "input": true,
          "multiple": true
      }
  ]
}

export const userAddFormAdmin = {
  "title": "User Form",
  "key": "user-form",
  "display": "form",
  "components": [
      {
        "label": "Full Name",
        "tableView": true,
        "key": "fullname",
        "type": "textfield",
        "input": true,
        "validate": {
          "required": true
        },
      },
      {
        "label": "Email",
        "tableView": true,
        "key": "email",
        "type": "email",
        "validate": {
          "required": true
        },
        "input": true
      },
      {
          "label": "Role",
          "widget": "choicesjs",
          "tableView": true,
          "disabled": false,
          "validate": {
            "required": true
          },
          "data": {
            "values": [
                {
                    "label": "Admin",
                    "value": "admin"
                },
                {
                    "label": "User",
                    "value": "user"
                },
                {
                  "label": "Any",
                  "value": "any"
                }
            ]
          },
          "key": "role",
          "type": "select",
          "input": true,
          "multiple": true,
      }
  ]
}

export const profileForm = {
  "title": "Profile Form",
  "key": "profile-form",
  "display": "form",
  "components": [
      {
          "label": "Full Name",
          "tableView": true,
          "key": "fullname",
          "type": "textfield",
          "input": true,
          "validate": {
            "required": true
          },
      },
      {
          "label": "Email",
          "tableView": true,
          "key": "email",
          "type": "email",
          "validate": {
            "required": true
          },
          "input": true
      },
      {
        "label": "Password",
        "tableView": false,
        "validate": {
            "required": true,
            "minLength": 8
        },
        "key": "password",
        "type": "password",
        "input": true,
        "protected": true
      },
      {
          "label": "Role",
          "widget": "choicesjs",
          "tableView": true,
          "validate": {
            "required": true
          },
          "data": {
              "values": [
                  {
                      "label": "Admin",
                      "value": "admin"
                  },
                  {
                      "label": "User",
                      "value": "user"
                  }
              ]
          },
          "key": "role",
          "type": "select",
          "input": true
      }
  ]
}

export const resetPasswordForm = {
  "title": "Reset Password Form",
  "key": "",
  "display": "form",
  "components": [
    {
        "label": "Password",
        "placeholder": "Enter new password",
        "customClass": "passwordField",
        "showCharCount": true,
        "tableView": false,
        "validate": {
            "required": true,
            "minLength": 8
        },
        "key": "password",
        "type": "password",
        "input": true,
        "protected": true
    },
    {
        "label": "Confirm Password",
        "placeholder": "Re-enter password",
        "customClass": "passwordField",
        "showCharCount": true,
        "tableView": false,
        "validate": {
            "required": true,
            "minLength": 8
        },
        "key": "password1",
        "type": "password",
        "input": true,
        "protected": true
    }
  ]
}

export const categoryForm = {
  "title": "category form",
  "key": "category-form",
  "display": "form",
  "components": [
    {
      "label": "Category Name",
      "tableView": true,
      "validate": {
          "required": true
      },
      "key": "categoryName",
      "type": "textfield",
      "input": true
    }
  ]
}
// "suffix": "<i style=\"cursor: pointer;\" id=\"showPass\" class=\"fa fa-eye\"></i>",
