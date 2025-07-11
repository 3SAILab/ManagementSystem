import { create } from 'zustand';

const useEmployeeStore = create((set) => ({
  // 用户信息初始状态
  employee: {
    name: '',
    gender: '',
    email: '',
    birth_date: '',
    department: '',
    position: '',
    manager: '',
    hire_date: '',
    is_probation: '',
  },
  
  // 更新用户邮箱
  updateEmail: (email) => set((state) => ({
    employee: { ...state.employee, email }
  })),
  //更新生日
  updateBirthDate: (birth_date) => set((state) => ({
    employee: { ...state.employee, birth_date }
  })),
  // 设置token
  setToken: (token) => set((state) => ({
    employee: { ...state.employee, token }
  })),
  
  // 清除用户信息
  clearEmployee: () => set({ 
    employee: {
        name: '',
        gender: '',
        email: '',
        birth_date: '',
        department: '',
        position: '',
        manager: '',
        hire_date: '',
        is_probation: '',
    }
  })
}));

export default useEmployeeStore;
export { useEmployeeStore };