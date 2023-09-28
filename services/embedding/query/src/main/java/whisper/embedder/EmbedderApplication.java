package whisper.embedder;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import whisper.embedder.service.EmbedderService;
import whisper.embedder.service.openapi.OpenAIService;
import whisper.embedder.service.openapi.model.ChatCompletionMessage;
import whisper.embedder.service.openapi.model.ChatCompletionMessage.Role;
import whisper.embedder.service.pinecone.PineconeService;

@SpringBootApplication
@RestController
public class EmbedderApplication {

	static OpenAIService openAIService = new OpenAIService();
	static PineconeService pineconeService = new PineconeService();
	
	public static void main(String[] args) {
		SpringApplication.run(EmbedderApplication.class, args);
	}

	@GetMapping("/insert-text")
	public Flux<Integer> insertText(@RequestParam(value = "id") String id, @RequestParam(value = "user") String user, @RequestParam(value = "text") String text) {
		EmbedderService es = new EmbedderService(openAIService, pineconeService);
		return es.insertEmbedding(id, user, text);
	}

	@GetMapping("/query-text")
	public Flux<List<String>> queryText(@RequestParam(value = "user") String user, @RequestParam(value = "text") String text) {
		ChatCompletionMessage ccm = new ChatCompletionMessage(Role.USER, text);
		EmbedderService es = new EmbedderService(openAIService, pineconeService);
		return es.queryEmbedding(user, Arrays.asList(ccm));
	}

	@GetMapping("/chat")
	public Flux<String> chat(@RequestParam(value = "from") String from, @RequestParam(value = "to") String to, @RequestParam(value = "prompt", defaultValue = "How may I help you?") String prompt, @RequestParam(value = "system") String system) {
		ChatCompletionMessage ccm = new ChatCompletionMessage(Role.USER, prompt);
		EmbedderService es = new EmbedderService(openAIService, pineconeService);
		return es.replyToChat(from, to, Arrays.asList(ccm), system, "influencer");
	}

	@GetMapping("/insert-chat-history")
	public void insertChatHistory(@RequestParam(value = "from") String from, @RequestParam(value = "to") String to, @RequestParam(value = "question") String question, @RequestParam(value = "answer") String answer) {
		EmbedderService es = new EmbedderService(openAIService, pineconeService);
		es.insertChatHistory(from, to, question, answer, null);
	}

	@GetMapping("/query-text-as-vector")
	public Flux<List<Double>> queryTextAsVector(@RequestParam(value = "user") String user, @RequestParam(value = "text") String text) {
		ChatCompletionMessage ccm = new ChatCompletionMessage(Role.USER, text);
		EmbedderService es = new EmbedderService(openAIService, pineconeService);
		return es.queryEmbeddingAsVector(user, Arrays.asList(ccm));
	}

}
