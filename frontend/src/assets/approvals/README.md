# Approval PDFs Setup

This folder contains the approval logos that correspond to the official PDF documents stored in `src/assets/documents/`.

## Current Logos Available:
- AICTE.png
- UGC.png
- bar-council-of-india.png
- Pharmacy-Council-of-India.jpg
- RCI.png
- sikkim-nursing-council.png
- association-of-indian-universities.png
- Govt-of-Sikkim.png

## Official PDF Documents (Located in `src/assets/documents/`):
The approval system uses the following official documents:

1. **UGC Approval**: `UGC-Letter-Copy-to-SAU.pdf`
2. **AICTE Approval**: `Common-AICTE-Approval-Letter-for-All-Universities.pdf`
3. **Bar Council Approval**: `BCI_Approval_2024-25-1.pdf`
4. **Pharmacy Council Approval**: `School-of-Pharmacy_Approval-Letter_2023-24.pdf`
5. **RCI Approval**: `RCI-Approval-SAU.pdf`
6. **Nursing Council Approval**: `Nursing-Approval-Letter.jpeg`
7. **AIU Membership**: `AIU-Membership-Letter-SAU.pdf`
8. **Government Approval**: `SAU-Gazette-Notification-Copy.pdf`

## How the System Works:
1. **Logos**: Stored in this folder (`src/assets/approvals/`)
2. **PDFs**: Stored in `src/assets/documents/`
3. **Integration**: The ApprovalsRecognitions component links logos to their corresponding PDFs
4. **Download**: Clicking any approval logo downloads the respective official document

## Note:
The system is now fully functional with official approval documents. No placeholder PDFs are needed.
