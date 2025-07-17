import api from "./api";

// 添加合同
export const addContract = async (contract) => {
    try {
        const response = await api.post("/contracts", contract);
        return response.data;
    } catch (error) {
        console.error("添加合同失败:", error);
        throw error;
    }
};

