package whisper.embedder.service;

import java.util.UUID;

public class IdGenerator {

	public static String generateId() {
		return UUID.randomUUID().toString();
	}
}
