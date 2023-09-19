package whisper.embedder.service.pinecone.model;

import java.util.List;

public class QueryResponse {

	private List<QueryMatch> matches;
	private String namespace;

	public List<QueryMatch> getMatches() {
		return matches;
	}
	public void setMatches(List<QueryMatch> matches) {
		this.matches = matches;
	}
	public String getNamespace() {
		return namespace;
	}
	public void setNamespace(String namespace) {
		this.namespace = namespace;
	}
	public List<Double> getTop() {
		return matches.get(0).getValues();
	}

}
