export const api_tokens = [
  {
    db_key: "hf_user",
    name: "Hugging face",
    set_route: "save_huggingface_key",
    delet_route: "delete_huggingface_key",
    attrs: [
      { key: "name", label: "Name" },
      { key: "fullname", label: "Full name" },
      { key: "token_name", label: "Token name" },
    ],
    website: "https://huggingface.co/docs/hub/security-tokens",
  },
  {
    db_key: "pollination_user",
    name: "Pollination",
    set_route: "save_pollination_key",
    delet_route: "delete_pollination_key",
    attrs: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
    ],
    website: "https://enter.pollinations.ai/",
  },
];
