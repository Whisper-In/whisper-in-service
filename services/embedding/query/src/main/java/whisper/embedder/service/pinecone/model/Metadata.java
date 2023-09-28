package whisper.embedder.service.pinecone.model;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Metadata {

	private Map<String, String> metadata;

	public Map<String, String> getMetadata() {
		return metadata;
	}

}