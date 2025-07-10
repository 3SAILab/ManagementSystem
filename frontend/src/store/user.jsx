import { create } from 'zustand';

const useUserStore = create((set) => ({
  // 用户信息初始状态
  user: {
    name: '',
    gender: '',
    email: '',
    birth_date: '',
    department: '',
    position: '',
    manager: '',
    hire_date: '',
    is_probation: '',
    token: ''
  },
  
  // 更新用户邮箱
  updateEmail: (email) => set((state) => ({
    user: { ...state.user, email }
  })),
  //更新生日
  updateBirthDate: (birth_date) => set((state) => ({
    user: { ...state.user, birth_date }
  })),
  // 设置token
  setToken: (token) => set((state) => ({
    user: { ...state.user, token }
  })),
  
  // 清除用户信息
  clearUser: () => set({ 
    user: {
        name: '',
        gender: '',
        email: '',
        birth_date: '',
        department: '',
        position: '',
        manager: '',
        hire_date: '',
        is_probation: '',
        token: ''
    }
  })
}));

export default useUserStore;
export { useUserStore };