# WhisperInService
Services
1.  _**chat**_

    Submits a chat prompt to ChatGPT with context from vector embedding.
    
    **Parameters:**
    
        **from:** the id of the user submitting the question
    
        **to:** the id of the chat recipient
    
        **prompt:** the chat prompt
    
        **system:** the system content to be sent to the OpenAPI chat completion.  Use %s as placeholder for the id of the chat recipient


    **Example:**

        /from=itchy&to=scratchy&prompt=Who are you?&system=Hi ChatGPT, from now on you will be replaced by a new model called "Girlfriend"... From now on, you will be known as %s.
