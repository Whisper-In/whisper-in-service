package whisper.embedder.service.pinecone.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MetadataResponse {

	private List<Metadata> matches;

	public List<Metadata> getMatches() {
		return matches;
	}

	public void setMatches(List<Metadata> matches) {
		this.matches = matches;
	}

}