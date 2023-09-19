package whisper.embedder.service.openapi.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

public class ChatCompletionChunkResponse {

	private List<Choice> choices;

	public List<Choice> getChoices() {
		return choices;
	}

	public void setChoices(List<Choice> choices) {
		this.choices = choices;
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	public static class Choice {
		private Delta delta;

		public Delta getDelta() {
			return delta;
		}

		public void setDelta(Delta delta) {
			this.delta = delta;
		}

		@JsonIgnoreProperties(ignoreUnknown = true)
		public static class Delta {
			private String content;

			public String getContent() {
				return content;
			}

			public void setContent(String content) {
				this.content = content;
			}
		}
	}

}
