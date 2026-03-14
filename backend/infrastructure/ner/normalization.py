from .spacy_model import get_nlp
from application.exceptions import INFRA_ERROR_LAYERS, InfrastructureError

def normalize_text(text: str) -> str:
    """get lemma lower tokens and remove stop, puncuation tokens"""

    nlp = get_nlp()
    doc = nlp(text)

    tokens = [
        token.lemma_.lower()
        for token in doc
        if not token.is_stop and not token.is_punct and not token.is_space
    ]
    return " ".join(tokens)

def normalize_texts(texts: list[str]) -> list[str]:
    """get lemma lower tokens and remove stop, puncuation tokens"""

    try:
        nlp = get_nlp()
        docs = nlp.pipe(texts)
        results = []
        for doc in docs:
            tokens = [
                token.lemma_.lower()
                for token in doc
                if not token.is_stop and not token.is_punct and not token.is_space
            ]
            results.append(" ".join(tokens))
        return results
    except Exception as ex:
        raise InfrastructureError(
            f"Error normalizing using spacy",
            layer=INFRA_ERROR_LAYERS.NORMALIZER,
            ex=ex,
            priority=2,
            details={"len_texts": len(texts), "first_text": texts[0]}
        )