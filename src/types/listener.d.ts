interface InteractionListener {
  type: Events.InteractionCreate;
  run: (interaction: BaseInteraction) => Promise<void>;
}

interface MessageListener {
  type: Events.MessageCreate;
  run: (interaction: MessageEvent) => Promise<void>;
}

type Listener = InteractionListener | MessageListener;