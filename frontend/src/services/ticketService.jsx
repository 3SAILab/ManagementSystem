import api from "./api";

//新增工单
export const addTicket = async (ticket) => {
    try {
        const response = await api.post('/tickets', ticket);
        if (response.data.success){
            return {success: true, data: response.data};
        } else {
            return {success: false, error: response.data.error};
        }
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

//根据合同id获取工单列表
export const getTicketsByContractId = async (contractId) => {
    try {
        const response = await api.get(`/tickets/contract/${contractId}`);
        if(response.data.success){
            return {success: true, data: response.data.data};
        }else{
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        throw error;
    }
};

//根据工单id获取工单信息
export const getTicketInfo = async (ticketId) => {
    try {
        const response = await api.get(`/tickets/${ticketId}`);
        if(response.data.success){
            return {success: true, data: response.data.data};
        }else{
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        throw error;
    }
};

//根据工单id更新工单信息
export const updateTicketInfo = async (ticketId, ticket) => {
    const params = {
        name: ticket.name,
        detail_pages: ticket.detail_pages,
        video_count: ticket.video_count,
        image_count: ticket.image_count,
        workflow_count: ticket.workflow_count,
        wechat_group: ticket.wechat_group,
        notes: ticket.notes,
        priority: ticket.priority,
        platform: ticket.platform,
        product_type_id: ticket.product_type_id,
        product_name: ticket.product_name,
        price: ticket.price,
    }
    try {
        const response = await api.put(`/tickets/${ticketId}`, params);
        if(response.data.success){
            return {success: true, data: response.data.data};
        }else{
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        throw error;
    }
};

//根据工单id删除工单
export const deleteTicket = async (ticketId) => {
    try {
        const response = await api.delete(`/tickets/${ticketId}`);
        if(response.data.success){
            return {success: true, data: response.data.data};
        }else{
            return {success: false, error: response.data.error};
        }
    } catch (error) {
        throw error;
    }
};

