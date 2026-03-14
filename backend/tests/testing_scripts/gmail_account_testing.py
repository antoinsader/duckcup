


from application.testing_data import get_inbox_criteria
from domain.domain_models.Requests import InboxCriteria

def main():
    account_id = 50
    criteria = InboxCriteria(
        sort_by="newest_first",
    )
    response = get_inbox_criteria(account_id, criteria)
    for email in response.items:
        print(email)
    # print(response.items)