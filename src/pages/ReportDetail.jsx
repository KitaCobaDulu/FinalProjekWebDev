import { useParams } from 'react-router-dom';

export default function ReportDetail() {
  const { id } = useParams(); // Mengambil angka :id dari URL
  return <h1>Halaman Detail Laporan (ID: {id})...</h1>;
}