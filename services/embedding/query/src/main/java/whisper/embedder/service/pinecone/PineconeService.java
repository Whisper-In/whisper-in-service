package whisper.embedder.service.pinecone;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aot.hint.annotation.RegisterReflectionForBinding;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import reactor.core.publisher.Mono;
import whisper.embedder.service.IdGenerator;
import whisper.embedder.service.pinecone.model.MetadataResponse;
import whisper.embedder.service.pinecone.model.QueryResponse;
import whisper.embedder.service.pinecone.model.UpsertResponse;

@Service
public class PineconeService {

	final Logger logger = LoggerFactory.getLogger(PineconeService.class);
	
    private final String PINECONE_API_KEY = "3d0fc07f-4809-403b-990a-b0f9e5ca3580";

    private final String PINECONE_API_URL = "https://whisper-8b30111.svc.gcp-starter.pinecone.io";
    
    private final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyyMMddHHmmss");

    private WebClient webClient;

    /*
     * Spring WebClient will be used for making calls to Pinecone REST services.
     */
    @PostConstruct
    void init() {
        this.webClient = WebClient.builder()
                .baseUrl(PINECONE_API_URL)
                .defaultHeader("Api-Key", PINECONE_API_KEY)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Upserts the embedding to the vector database.
     */
    @SuppressWarnings("unlikely-arg-type")
	@RegisterReflectionForBinding({UpsertResponse.class})
    public Mono<Integer> upsert(String id, String user, String text, List<Double> embedding,  String namespace) {
    	System.out.println("[PineconeService][upsert] " + text);
		var body = Map.of(
			"vectors", Map.of(
				"id", id,
				"values", embedding,
				"metadata", Map.of(
					"user", user,
					"text", text
				)
			)
		);

		if (webClient == null) {
			init();
		}

        return this.webClient.post()
                .uri("/vectors/upsert")
                .bodyValue(body)
                .retrieve()
                .onStatus( 
                	HttpStatus.BAD_REQUEST::equals,
                	response -> response.bodyToMono(String.class).map(Exception::new)) 
                .bodyToMono(UpsertResponse.class)
                .map(UpsertResponse::getUpsertedCount);
    }

    /**
     * Upserts the embedding to the vector database.
     */
    @SuppressWarnings("unlikely-arg-type")
	@RegisterReflectionForBinding({UpsertResponse.class})
    public Mono<Integer> upsertChatResponse(String id, String from, String to, String question, String answer, List<Double> embedding,  String namespace) {
    	System.out.println("[PineconeService][upsertChatResponse][id] " + id);
    	System.out.println("[PineconeService][upsertChatResponse][from] " + from);
    	System.out.println("[PineconeService][upsertChatResponse][to] " + to);
    	System.out.println("[PineconeService][upsertChatResponse][question] " + question);
    	System.out.println("[PineconeService][upsertChatResponse][answer] " + answer);
    	System.out.println("[PineconeService][upsertChatResponse][embedding] " + embedding);

    	var body = Map.of(
			"vectors", Map.of(
				"id", id,
				"values", embedding,
				"metadata", Map.of(
					"from", from,
					"to", to,
					"date", DATE_FORMAT.format(new Date()),
					"question", question,
					"answer", answer
				)
			)
		);

		if (webClient == null) {
			init();
		}

		Mono<Integer> upsertedCount = this.webClient.post()
                .uri("/vectors/upsert")
                .bodyValue(body)
                .retrieve()
                .onStatus( 
                	HttpStatus.BAD_REQUEST::equals,
                	response -> response.bodyToMono(String.class).map(Exception::new)) 
                .bodyToMono(UpsertResponse.class)
                .map(UpsertResponse::getUpsertedCount);

		StringBuilder sb = new StringBuilder();
		upsertedCount.subscribe(
	    		data -> sb.append(data),
	    		err -> {},
	    		() -> System.out.println("upserted " + sb + " records")
	    		);

		return upsertedCount;
    }

    /**
     * Upserts the embedding to the vector database.
     */
	@RegisterReflectionForBinding({UpsertResponse.class})
    public void upsertChatResponse(String from, String to, String question, String answer, Mono<List<Double>> embedding,  String namespace) {
	    List<Double> vector = new ArrayList<Double>(); 
	    embedding.subscribe(
	    		data -> vector.addAll(data),
	    		err -> {},
	    		() -> upsertChatResponse(IdGenerator.generateId(), from, to, question, answer, vector, namespace)
	    );
    }

    /**
     * Searches a namespace, using a query vector.
	 * It retrieves the values of the most similar vectors in a namespace.
     */
    @SuppressWarnings("unlikely-arg-type")
	@RegisterReflectionForBinding({QueryResponse.class})
    public Mono<List<Double>> query(String user, List<Double> embedding, int maxResults, String namespace) {
    	System.out.println("[PineconeService][query][embedding] " + embedding);
		var body = Map.of(
			"topK", maxResults,
			"vector", embedding,
			"filter", Map.of(
				"user", user
			),
			"includeValues", true,
			"includeMetadata", true
		);

		if (webClient == null) {
			init();
		}

        return this.webClient.post()
                .uri("/query")
                .bodyValue(body)
                .retrieve()
                .onStatus( 
                	    HttpStatus.BAD_REQUEST::equals,
                	    response -> response.bodyToMono(String.class).map(Exception::new))
                .bodyToMono(QueryResponse.class)
                .map(QueryResponse::getTop);
    }

    /**
     * Searches a namespace, using a query vector.
	 * It retrieves the text of the most similar items in a namespace.
     */
    @SuppressWarnings("unlikely-arg-type")
	@RegisterReflectionForBinding({MetadataResponse.class})
    public Mono<List<String>> queryText(String user, List<Double> embedding, int maxResults, String namespace) {
		var body = Map.of(
				"topK", maxResults,
				"vector", embedding,
				"filter", Map.of(
					"user", user
				),
				"includeMetadata", true
			);

        if (webClient == null) {
        	init();
        }

        return this.webClient.post()
                .uri("/query")
                .bodyValue(body)
                .retrieve()
                .onStatus( 
                	    HttpStatus.BAD_REQUEST::equals,
                	    response -> response.bodyToMono(String.class).map(Exception::new)) 
                .bodyToMono(MetadataResponse.class)
                .map(MetadataResponse::getMatches)
                .flatMapIterable(matches -> matches)
                .map(match -> {
                    if (match.getMetadata() != null && match.getMetadata().containsKey("text")) {
                        return match.getMetadata().get("text");
                    } else {
                        return "";
                    }
                })
                .filter(doc -> !doc.isBlank())
                .collectList();
    }

}
