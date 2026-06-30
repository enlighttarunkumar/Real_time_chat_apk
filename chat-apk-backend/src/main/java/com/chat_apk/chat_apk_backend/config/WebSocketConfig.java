package com.chat_apk.chat_apk_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final String frontendUrl;

    public WebSocketConfig(@Value("${app.frontend-url}") String frontendUrl) {
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        config.enableSimpleBroker("/topic");
        // /topic/messages

        config.setApplicationDestinationPrefixes("/app");
        // /app/chat
        // server-side: @MessagingMapping("/chat)


    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat")//connection establishment
                .setAllowedOriginPatterns(
                        frontendUrl,
                        AppConstant.LOCAL_URL,
                        AppConstant.LOCAL_IP_URL
                )
                .withSockJS();
    }
    // /chat endpoint par connection apka establish hoga
}
