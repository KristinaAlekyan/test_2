const succeedResponse = (message, data) => {
    const response = { success: true, message, data };
    return response;
}

exports.succeedResponse = succeedResponse;