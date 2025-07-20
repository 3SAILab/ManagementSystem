import api from "./api";

//新增工单
export const addTicket = async (ticket) => {
    try {
        const response = await api.post('/tickets', ticket);
        return response.data;
    } catch (error) {
        console.error('创建工单失败:', error);
        throw error;
    }
};

//获取工单
export const getTickets = async () => {
    try {
        const response = await api.get('/tickets');
        return response.data;
    } catch (error) {
        console.error('获取工单失败:', error);
        throw error;
    }
};

//根据合同ID获取工单
export const getTicketsByContractId = async (contractId) => {
    try {
        const response = await api.get(`/tickets/contract/${contractId}`);
        return response.data;
    } catch (error) {
        console.error('获取合同工单失败:', error);
        throw error;
    }
};