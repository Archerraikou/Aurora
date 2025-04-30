import React, { useState, useEffect } from "react";

function Message({message, user})
{
    // aici se poate configura sa arate bine mesajele :D
    // user - are toate informatiile utilizatorului
    // message - are mesajul
    return (
        <div>
            <b>{user.nick}: </b>{message.message}
        </div>
    );
}

export default Message;