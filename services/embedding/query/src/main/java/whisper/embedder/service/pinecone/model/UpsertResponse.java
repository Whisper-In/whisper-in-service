package whisper.embedder.service.pinecone.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UpsertResponse {

	int upsertedCount;

	public int getUpsertedCount() {
		return upsertedCount;
	}

	public void setMatches(int upsertedCount) {
		this.upsertedCount = upsertedCount;
	}

}