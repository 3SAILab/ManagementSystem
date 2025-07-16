import api from "./api";

// 添加合同
export const addContract = async (contract) => {
    const response = await api.post("/contracts", contract);
    return response.data;
};

