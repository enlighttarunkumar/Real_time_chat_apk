import { httpClient } from "../config/AxiosHelper";

export const createRoom = async (roomDetail) => {
    const response = await httpClient.post(`/api/v1/rooms`, roomDetail);
    return response.data;
};

export const joinRoomApi = async (roomId) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
    return response.data;
};

export const rejoinProfessorRoom = async (roomId, professorPin) => {
    const response = await httpClient.post(`/api/v1/rooms/${roomId}/professor/rejoin`, {
        professorPin,
    });
    return response.data;
};

export const getMessages = async (roomId, size = 50, page = 0) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`);
    return response.data;
};

export const resolveRoom = async (roomId, professorToken) => {
    const response = await httpClient.patch(`/api/v1/rooms/${roomId}/resolve`, null, {
        headers: { "X-Professor-Token": professorToken },
    });
    return response.data;
};

export const pinMessage = async (roomId, messageId, professorToken) => {
    const response = await httpClient.patch(`/api/v1/rooms/${roomId}/messages/${messageId}/pin`, null, {
        headers: { "X-Professor-Token": professorToken },
    });
    return response.data;
};

export const searchProfessors = async (prefix = "") => {
    const response = await httpClient.get(`/api/v1/professors/search`, {
        params: { prefix },
    });
    return response.data;
};

export const saveProfessor = async (professor) => {
    const response = await httpClient.post(`/api/v1/professors`, professor);
    return response.data;
};

export const rateProfessor = async (professorId, rating) => {
    const response = await httpClient.post(`/api/v1/professors/${professorId}/rating`, { rating });
    return response.data;
};

export const updateProfessorStatus = async (roomId, online, professorToken) => {
    const response = await httpClient.patch(`/api/v1/rooms/${roomId}/professor/status`, null, {
        params: { online },
        headers: { "X-Professor-Token": professorToken },
    });
    return response.data;
};
