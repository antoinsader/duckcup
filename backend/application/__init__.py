
# It contains:
    # Workflows
    # Pipelines
    # Orchestration
    # Use cases

# It coordinates.
# It does not define business concepts.
# It does not handle raw external protocols.
# It glues things together.



# How To Decide Where Something Belongs
# Ask these questions:
# Question 1:
# If I change business rules, does this change?
# If yes → Domain or Application.
# Question 2:
# If I change external provider/library/database, does this change?
# If yes → Infrastructure.
# Question 3:
# Is this code coordinating multiple services in sequence?
# If yes → Application.
# Question 4:
# Does this code represent a concept in the business problem?
# If yes → Domain.
