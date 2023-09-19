package whisper.embedder.service.openapi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ModerationResponse {

	private List<ModerationResult> results;

	public List<ModerationResult> getResults() {
		return results;
	}

	public void setResults(List<ModerationResult> results) {
		this.results = results;
	}

}