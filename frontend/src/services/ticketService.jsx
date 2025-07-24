import api from "./api";

//新增工单
export const addTicket = async (ticket) => {
    try {
        const response = await api.post('/tickets', ticket);
        return {success: true, data: response.data};
    } catch (error) {
        throw error;
    }
};

//获取工单
export const getTickets = async () => {
    try {
        const response = await api.get('/tickets');
        return {success: true, data: response.data};
    } catch (error) {
        throw error;
    }
};

//根据合同ID获取工单
export const getTicketsByContractId = async (contractId) => {
    try {
        const response = await api.get(`/tickets/contract/${contractId}`);
        return {success: true, data: response.data};
    } catch (error) {
        throw error;
    }
};