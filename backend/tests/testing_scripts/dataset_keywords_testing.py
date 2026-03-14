

from application.use_cases.emails_analysis import get_dataset_keywords


def main():

    dataste_id = 2
    user_id = 1
    top_n = 100

    text_attribute = "text"

    ds_content = [
        {
            "text": "This is a sample email content for testing the keyword extraction functionality."
        },
        {
            "text": "Another email content to test the KeyBERT keyword extraction process."
        },
        {
            "text": "Testing the keyword extraction with KeyBERT on different email contents."
        },
        {
            "text": "This email content is machine way meant to evaluate the performance of the KeyBERT keyword extraction."
        },
        {
            "text": "KeyBERT machine learning should be able to extract relevant keywords from this email content as well."
        }
    ]
    content_texts = [m[text_attribute] for m in ds_content]
    dataset_keywords = get_dataset_keywords(content_texts, top_n=top_n)

    keywords = [ {"text": text, "value": score} for text, score in dataset_keywords]

    print(f"Dataset Keywords: {keywords}")
