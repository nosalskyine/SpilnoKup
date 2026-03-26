import SwiftUI
import AVFoundation
import CoreImage.CIFilterBuiltins

struct QRView: View {
    @EnvironmentObject var api: APIService
    @State private var scanning = false
    @State private var manualCode = ""
    @State private var verifying = false
    @State private var result: QROrderInfo?
    @State private var error = ""
    @State private var sellerOrders: [Order] = []

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                Text("QR-центр").font(.system(size: 22, weight: .heavy)).foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Скануйте QR покупця для підтвердження").font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                    .frame(maxWidth: .infinity, alignment: .leading)

                // Success result
                if let r = result {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill").font(.system(size: 48)).foregroundColor(AppTheme.green)
                        Text("Видачу підтверджено!").font(.system(size: 18, weight: .heavy)).foregroundColor(AppTheme.green)
                        VStack(spacing: 6) {
                            infoRow("Покупець", r.buyer ?? "")
                            infoRow("Товар", r.item ?? "")
                            infoRow("Кількість", "\(r.quantity ?? 0) \(r.unit ?? "")")
                            infoRow("Сума", "₴\(Int(r.amount ?? 0))")
                        }.padding(12).background(AppTheme.green.opacity(0.06)).cornerRadius(10)
                        Text("Кошти зараховано").font(.system(size: 10)).foregroundColor(AppTheme.textSec)
                        Button("Готово") { result = nil; UIImpactFeedbackGenerator(style: .light).impactOccurred() }
                            .modifier(PrimaryButton())
                    }.padding(20).background(AppTheme.card).cornerRadius(14)
                } else {
                    // Scan button
                    Button { scanning = true; UIImpactFeedbackGenerator(style: .light).impactOccurred() } label: {
                        HStack(spacing: 14) {
                            Image(systemName: "camera.viewfinder").font(.system(size: 28)).foregroundColor(.white)
                                .frame(width: 50, height: 50).background(AppTheme.accent).cornerRadius(12)
                            VStack(alignment: .leading) {
                                Text("Сканувати QR").font(.system(size: 15, weight: .heavy)).foregroundColor(.white)
                                Text("Відкрити камеру").font(.system(size: 11)).foregroundColor(AppTheme.textSec)
                            }
                            Spacer()
                        }
                        .padding(14).background(AppTheme.green.opacity(0.06)).cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.green.opacity(0.15), lineWidth: 1))
                    }

                    // Manual input
                    VStack(spacing: 8) {
                        Text("Або введіть код").font(.system(size: 12, weight: .bold)).foregroundColor(.white)
                        HStack {
                            TextField("", text: $manualCode, prompt: Text("Вставте код").foregroundColor(AppTheme.textMuted))
                                .foregroundColor(.white).modifier(InputStyle())
                            Button(verifying ? "..." : "OK") { verify(manualCode) }
                                .disabled(manualCode.isEmpty || verifying)
                                .padding(.horizontal, 16).padding(.vertical, 14)
                                .background(manualCode.isEmpty ? AppTheme.cardAlt : AppTheme.accent)
                                .foregroundColor(manualCode.isEmpty ? AppTheme.textMuted : .black)
                                .fontWeight(.bold).cornerRadius(10)
                        }
                    }.padding(14).background(AppTheme.card).cornerRadius(12)

                    if !error.isEmpty { Text(error).font(.caption).foregroundColor(.red) }

                    // Orders
                    let paid = sellerOrders.filter { $0.status == "PAID" }
                    if !paid.isEmpty {
                        Text("Очікують видачі (\(paid.count))").font(.system(size: 13, weight: .heavy)).foregroundColor(.white)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        ForEach(paid) { o in
                            HStack(spacing: 10) {
                                Image(systemName: "shippingbox.fill").foregroundColor(AppTheme.accent)
                                VStack(alignment: .leading) {
                                    Text(o.buyer?.name ?? "Покупець").font(.system(size: 12, weight: .bold)).foregroundColor(.white)
                                    Text("\(o.deal?.title ?? "") × \(o.quantity ?? 0)").font(.system(size: 10)).foregroundColor(AppTheme.textSec)
                                }
                                Spacer()
                                Text("₴\(o.amount ?? "0")").font(.system(size: 13, weight: .heavy)).foregroundColor(AppTheme.green)
                            }.padding(12).background(AppTheme.card).cornerRadius(10)
                        }
                    }
                }
            }.padding(16)
        }
        .background(AppTheme.bg)
        .sheet(isPresented: $scanning) { QRScannerView { code in scanning = false; verify(code) } }
        .task { sellerOrders = (try? await api.fetchSellerOrders()) ?? [] }
    }

    func verify(_ code: String) {
        verifying = true; error = ""
        Task {
            do {
                let resp = try await api.verifyQR(token: code)
                UINotificationFeedbackGenerator().notificationOccurred(.success)
                result = resp.order
                sellerOrders = (try? await api.fetchSellerOrders()) ?? []
            } catch { self.error = error.localizedDescription }
            verifying = false
        }
    }

    func infoRow(_ key: String, _ val: String) -> some View {
        HStack {
            Text(key).font(.system(size: 12)).foregroundColor(AppTheme.textSec)
            Spacer()
            Text(val).font(.system(size: 12, weight: .bold)).foregroundColor(.white)
        }
    }
}

struct QRScannerView: UIViewControllerRepresentable {
    var onScan: (String) -> Void
    func makeUIViewController(context: Context) -> ScannerVC { ScannerVC(onScan: onScan) }
    func updateUIViewController(_ vc: ScannerVC, context: Context) {}

    class ScannerVC: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
        var onScan: (String) -> Void
        let session = AVCaptureSession()
        init(onScan: @escaping (String) -> Void) { self.onScan = onScan; super.init(nibName: nil, bundle: nil) }
        required init?(coder: NSCoder) { fatalError() }
        override func viewDidLoad() {
            super.viewDidLoad()
            guard let device = AVCaptureDevice.default(for: .video), let input = try? AVCaptureDeviceInput(device: device) else { return }
            session.addInput(input)
            let output = AVCaptureMetadataOutput()
            session.addOutput(output)
            output.setMetadataObjectsDelegate(self, queue: .main)
            output.metadataObjectTypes = [.qr]
            let preview = AVCaptureVideoPreviewLayer(session: session)
            preview.frame = view.bounds; preview.videoGravity = .resizeAspectFill
            view.layer.addSublayer(preview)
            DispatchQueue.global().async { self.session.startRunning() }
        }
        func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput results: [AVMetadataObject], from connection: AVCaptureConnection) {
            if let code = results.first as? AVMetadataMachineReadableCodeObject, let val = code.stringValue {
                session.stopRunning()
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                dismiss(animated: true) { self.onScan(val) }
            }
        }
    }
}
