export const rules = {
  email: {
    required: {
      value: true,
      message: 'Email là bắt buộc'
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Email không đúng định dạng'
    },
    maxLength: {
      value: 160,
      message: 'Email tối đa 160 ký tự'
    }
  },
  password: {
    required: {
      value: true,
      message: 'Mật khẩu là bắt buộc'
    },
    minLength: {
      value: 6,
      message: 'Mật khẩu tối thiểu 6 ký tự'
    },
    maxLength: {
      value: 160,
      message: 'Mật khẩu tối đa 160 ký tự'
    }
  },
  confirmPassword: {
    required: {
      value: true,
      message: 'Xác nhận mật khẩu là bắt buộc'
    },
    minLength: {
      value: 6,
      message: 'Mật khẩu tối thiểu 6 ký tự'
    },
    maxLength: {
      value: 160,
      message: 'Mật khẩu tối đa 160 ký tự'
    }
  },
  username: {
    required: {
      value: true,
      message: 'Tên người dùng là bắt buộc'
    },
    minLength: {
      value: 2,
      message: 'Tên tối thiểu 2 ký tự'
    },
    maxLength: {
      value: 50,
      message: 'Tên tối đa 50 ký tự'
    }
  }
}

export const getConfirmPasswordRule = (getValues: () => string) => ({
  ...rules.confirmPassword,
  validate: (value: string) => value === getValues() || 'Mật khẩu không khớp'
})
