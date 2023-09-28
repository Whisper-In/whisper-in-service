package whisper.embedder.service.openapi;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import whisper.embedder.service.openapi.model.ChatCompletionChunkResponse;
import whisper.embedder.service.openapi.model.ChatCompletionMessage;
import whisper.embedder.service.openapi.model.EmbeddingResponse;
import whisper.embedder.service.openapi.model.ModerationRequest;
import whisper.embedder.service.openapi.model.ModerationResponse;

/**
 * Service class for OpenAPI calls.
 */
@Service
public class OpenAIService {

	private final Logger logger = LoggerFactory.getLogger(OpenAIService.class);
	
	private static final String OPENAI_API_URL = "https://api.openai.com";
	private static final String OPENAI_API_KEY = "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";

	/*
	 * Use OpenAI second generation embedding model.
	 * Max Input Tokens: 8191
	 * Output Dimensions: 1536 (the Pinecone index dimensions should match this value).
	 */
	private static final String OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002";
		

	private WebClient webClient;

	/*
	 * Spring WebClient to make REST service calls to the OpenAI API.
	 */
	@PostConstruct
	void init() {
		System.out.println("[OpenAIService][init]");
		var client = HttpClient.create().responseTimeout(Duration.ofSeconds(45));
		this.webClient = WebClient.builder()
				.clientConnector(new ReactorClientHttpConnector(client))
				.baseUrl(OPENAI_API_URL).defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
				.defaultHeader("Authorization", "Bearer " + OPENAI_API_KEY)
				.build();
	}

	/**
	 * Handle moderation requests, which are used to screen messages for content that violates OpenAI's terms.
	 */
    public Mono<Boolean> moderate(List<ChatCompletionMessage> messages) {
        return Flux.fromIterable(messages)
                .flatMap(this::sendModerationRequest)
                .collectList()
                .map(moderationResponses -> {
                    boolean hasFlaggedContent = moderationResponses.stream()
                            .anyMatch(response -> response.getResults().get(0).isFlagged());
                    return !hasFlaggedContent;
                });
    }

    @RegisterReflectionForBinding({ModerationRequest.class, ModerationResponse.class})
    private Mono<ModerationResponse> sendModerationRequest(ChatCompletionMessage message) {
        logger.debug("Sending moderation request for message: {}", message.getContent());
        System.out.println("[sendModerationRequest] webClient = " + webClient);
        if (webClient == null) {
        	init();
        }
        System.out.println("[sendModerationRequest] webClient = " + webClient);
        return webClient.post()
                .uri("/v1/moderations")
                .bodyValue(new ModerationRequest(message.getContent()))
                .retrieve()
                .bodyToMono(ModerationResponse.class);
    }
    
	/**
	 * Retrieve an embedding vector for a given text.
	 * This embedding vector is used for similarity searches.
	 */
    @RegisterReflectionForBinding(EmbeddingResponse.class)
    public Mono<List<Double>> createEmbedding(String text) {
        logger.debug("creating embedding for text: {}", text);

        if (webClient == null) {
        	init();
        }

        Map<String, Object> body = Map.of(
                "model", OPENAI_EMBEDDING_MODEL,
                "input", text
        );

        return webClient.post()
                .uri("/v1/embeddings")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(EmbeddingResponse.class)
                .map(EmbeddingResponse::getEmbedding);
    }

    @RegisterReflectionForBinding({ChatCompletionChunkResponse.class})
    public Flux<String> generateCompletionStream(List<ChatCompletionMessage> messages) {
        logger.debug("Generating completion for messages: {}", messages);

		return webClient
				.post().uri("/v1/chat/completions")
				.bodyValue(Map.of(
						"model", "gpt-3.5-turbo",
						"messages", messages,
						"stream", true))
				.retrieve()
				.bodyToFlux(ChatCompletionChunkResponse.class).onErrorResume(error -> {

					// The stream terminates with a `[DONE]` message, which causes a serialization
					// error
					// Ignore this error and return an empty stream instead
					if (error.getMessage().contains("JsonToken.START_ARRAY")) {
						return Flux.empty();
					}

					// If the error is not caused by the `[DONE]` message, return the error
					else {
						return Flux.error(error);
					}
				}).filter(response -> {
					var content = response.getChoices().get(0).getDelta().getContent();
					logger.debug("received chunk: {}", content);
					return content != null && !content.equals("\n\n");
				}).map(response -> response.getChoices().get(0).getDelta().getContent());
    }
}
