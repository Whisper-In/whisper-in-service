package whisper.embedder.service.pinecone.model;

import java.util.List;
import java.util.Map;

public class QueryMatch {

	private String id;
	private double score;
	private List<Double> values;
	private SparseValue sparseValues;
	private Map<String, String> metadata;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public double getScore() {
		return score;
	}

	public void setScore(double score) {
		this.score = score;
	}

	public List<Double> getValues() {
		return values;
	}

	public void setValues(List<Double> values) {
		this.values = values;
	}

	public SparseValue getSparseValues() {
		return sparseValues;
	}

	public void setSparseValues(SparseValue sparseValues) {
		this.sparseValues = sparseValues;
	}

	public Map<String, String> getMetadata() {
		return metadata;
	}

	public void setMetadata(Map<String, String> metadata) {
		this.metadata = metadata;
	}
	
	class SparseValue {
		int[] indices;
		double[] values;
		public int[] getIndices() {
			return indices;
		}
		public void setIndices(int[] indices) {
			this.indices = indices;
		}
		public double[] getValues() {
			return values;
		}
		public void setValues(double[] values) {
			this.values = values;
		}
	}

}
